import * as React from "react";
import {
  useAddress,
  useConnectedWallet,
  useContract,
  useContractRead,
} from "@thirdweb-dev/react-native";
import { Redirect } from "expo-router";
import { SafeAreaView, View, Text, ScrollView, Pressable } from "react-native";
import {
  ActivityIndicator,
  Divider,
  Icon,
  IconButton,
} from "react-native-paper";
import Avatar from "../../../components/avatar";
import CircularButton from "../../../components/circular-button";
import LogoutModal from "../../../components/modals/logout-modal";
import { router } from "expo-router";
import { useUserStore } from "../../../store";
import { BigNumber } from "ethers";
import { GHO_SEPOLIA_ADDRESS, sepolia } from "../../../constants/sepolia";
import { useTransactionsStore } from "../../../store/use-transactions-store";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firebaseFirestore } from "../../../firebaseConfig";
import { DBTransaction } from "../../../store/interfaces";
import TimeAgo from "@andordavoti/react-native-timeago";
import * as WebBrowser from "expo-web-browser";

export default function Home() {
  const signer = useConnectedWallet();
  const [showModal, setShowModal] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const user = useUserStore((state) => state.user);
  const { contract } = useContract(GHO_SEPOLIA_ADDRESS);
  const address = useAddress();
  const {
    data: balanceData,
    isLoading: balanceOfLoading,
    error,
    refetch: balanceRefetch,
  } = useContractRead(contract, "balanceOf", [user?.address]);
  const transactions = useTransactionsStore((state) => state.transactions);
  const setTransactions = useTransactionsStore(
    (state) => state.setTransactions
  );
  const balance = balanceData
    ? (balanceData as BigNumber)
        .div(BigNumber.from(10).pow(18))
        .toNumber()
        .toFixed(2)
    : (0).toFixed(2);

  const onRefresh = async () => {
    setRefreshing(true);
    setTransactions([]);
    try {
      await Promise.all([balanceRefetch(), fetchTransactions()]);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setRefreshing(true);
    try {
      const toQ = query(
        collection(firebaseFirestore, "transactions"),
        where("to", "==", user?.address)
      );
      const fromQ = query(
        collection(firebaseFirestore, "transactions"),
        where("from", "==", user?.address)
      );

      const [toSnapshot, fromSnapshot] = await Promise.all([
        getDocs(toQ),
        getDocs(fromQ),
      ]);

      const toTransactions = toSnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id } as unknown as DBTransaction;
      });
      const fromTransactions = fromSnapshot.docs.map((doc) => {
        return { ...doc.data(), id: doc.id } as unknown as DBTransaction;
      });

      const transactions = [...toTransactions, ...fromTransactions].sort(
        (a, b) => {
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
      );
      setTransactions(transactions);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  if (!signer || !user) {
    return <Redirect href={"/"} />;
  }

  return (
    <SafeAreaView className="bg-[#201F2D] flex-1">
      <View className="flex flex-col px-4 mt-2 bg-[#201F2D]">
        <View className="flex flex-row items-center justify-between">
          <View className="flex flex-row items-center space-x-4 pl-2">
            <Avatar name={user.username.charAt(0).toUpperCase()} />
            <Text className="text-[#C9B3F9] font-bold text-3xl">GHOst</Text>
          </View>
          <View className="flex flex-row items-center">
            {!refreshing ? (
              <IconButton
                icon={() => <Icon source="refresh" color="#FFF" size={32} />}
                onPress={() => onRefresh()}
              />
            ) : (
              <View className="mr-4">
                <ActivityIndicator animating={true} color={"#FFF"} />
              </View>
            )}
            <IconButton
              icon={() => <Icon source="logout" color="#FFF" size={24} />}
              onPress={() => setShowModal(true)}
            />
          </View>
        </View>
        <View className="p-24 flex flex-col space-y-4">
          <Text className="text-[#53516C] font-semibold text-center">
            Your balance
          </Text>
          <Text className="text-white font-bold text-center text-5xl">
            ${balance}
          </Text>
          <View className="flex flex-row justify-evenly items-center">
            <CircularButton
              text="Add money"
              icon="plus"
              onPress={() => router.push("/app/add-money-modal")}
            />
            <CircularButton
              text="Send"
              icon="send"
              onPress={() => router.push("/app/send")}
            />
          </View>
        </View>
        <Text className="text-[#53516C] font-semibold mt-4 mb-2">
          Transaction History
        </Text>
        <Divider />
        {refreshing && transactions.length === 0 && (
          <View className="mt-4">
            <ActivityIndicator animating={true} color={"#C9B3F9"} />
          </View>
        )}
        {transactions.length === 0 && !refreshing && (
          <Text className="mt-4 text-white">
            No recent transactions available.
          </Text>
        )}
        {transactions.length > 0 && (
          <ScrollView className="h-full">
            {transactions.map((transaction, index) => {
              const { from, toUsername, fromUsername, createdAt, txHash } =
                transaction;
              const amount = parseFloat(transaction.amount);
              const isFrom = from === user?.address;
              return (
                <Pressable
                  key={`event-${index}`}
                  onPress={async () => {
                    await WebBrowser.openBrowserAsync(
                      `${sepolia.explorers[0].url}/tx/${txHash}`
                    );
                  }}
                >
                  <View className="flex flex-row items-center justify-between py-4">
                    <View className="flex flex-row items-center space-x-4">
                      <Avatar
                        name={(isFrom ? toUsername : fromUsername)
                          .charAt(0)
                          .toUpperCase()}
                      />
                      <View className="flex flex-col">
                        <Text className="text-white font-semibold text-lg">
                          {isFrom ? toUsername : fromUsername}
                        </Text>

                        <Text className="text-[#53516C]">
                          Click to view detail
                        </Text>
                      </View>
                    </View>
                    <View className="flex flex-col items-end justify-center">
                      <Text
                        className={`${
                          !isFrom ? "text-emerald-500" : "text-red-500"
                        } font-semibold text-lg`}
                      >
                        {!isFrom ? "+" : "-"} ${amount.toFixed(2)}
                      </Text>
                      <Text className="text-[#53516C]">
                        <TimeAgo dateTo={new Date(createdAt)} />
                      </Text>
                    </View>
                  </View>
                  <Divider />
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
      <LogoutModal visible={showModal} hideModal={() => setShowModal(false)} />
    </SafeAreaView>
  );
}
