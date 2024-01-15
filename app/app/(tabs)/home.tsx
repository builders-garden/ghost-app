import * as React from "react";
import {
  useAddress,
  useConnectedWallet,
  useContract,
  useContractRead,
} from "@thirdweb-dev/react-native";
import { Redirect } from "expo-router";
import { SafeAreaView, View, Text, ScrollView } from "react-native";
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
import { GHO_SEPOLIA_ADDRESS } from "../../../constants/sepolia";
import { useTransactionsStore } from "../../../store/use-transactions-store";
import { collection, getDocs, query, where } from "firebase/firestore";
import { firebaseFirestore } from "../../../firebaseConfig";
import { DBTransaction } from "../../../store/interfaces";

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
  } = useContractRead(contract, "balanceOf", [address]);
  const { data: decimalsData, isLoading: decimalsLoading } = useContractRead(
    contract,
    "decimals",
    []
  );
  const transactions = useTransactionsStore((state) => state.transactions);
  const setTransactions = useTransactionsStore(
    (state) => state.setTransactions
  );
  const balance =
    balanceData && decimalsData
      ? (balanceData as BigNumber)
          .div(BigNumber.from(10).pow(decimalsData as number))
          .toNumber()
          .toFixed(2)
      : (0).toFixed(2);

  const onRefresh = async () => {
    setRefreshing(true);
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
        where("to", "==", address)
      );
      const fromQ = query(
        collection(firebaseFirestore, "transactions"),
        where("from", "==", address)
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
          <View className="flex flex-row items-center space-x-4">
            <Avatar name={user.username.charAt(0).toUpperCase()} />
            <Text className="text-white font-bold text-3xl">Ghost</Text>
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
        {refreshing && (
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
          <ScrollView>
            {transactions.map((transaction, index) => {
              const { to, createdAt } = transaction;
              const amount = parseFloat(transaction.amount);
              return (
                <>
                  <View
                    className="flex flex-row items-center justify-between py-4"
                    key={`event-${index}`}
                  >
                    <View className="flex flex-row items-center space-x-4">
                      <Avatar
                        name={transaction.fromUsername.charAt(0).toUpperCase()}
                      />
                      <Text className="text-white font-semibold text-lg">
                        {transaction.fromUsername}
                      </Text>
                    </View>
                    <View className="flex flex-col items-end justify-center space-y-1">
                      <Text
                        className={`${
                          to === address ? "text-emerald-500" : "text-red-500"
                        } font-semibold`}
                      >
                        {to === address ? "+" : "-"} ${amount.toFixed(2)}
                      </Text>
                      <Text className="text-xs text-[#53516C]">
                        {createdAt}
                      </Text>
                    </View>
                  </View>
                  <Divider />
                </>
              );
            })}
          </ScrollView>
        )}
      </View>
      <LogoutModal visible={showModal} hideModal={() => setShowModal(false)} />
    </SafeAreaView>
  );
}
