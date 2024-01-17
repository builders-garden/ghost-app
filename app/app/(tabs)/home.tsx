import * as React from "react";
import {
  useConnectedWallet,
  useContract,
  useContractRead,
} from "@thirdweb-dev/react-native";
import { Link, Redirect } from "expo-router";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Pressable,
  ImageBackground,
} from "react-native";
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
import Toast from "react-native-toast-message";
import TransactionItem from "../../../components/transaction-item";
import TransactionsList from "../../../components/transactions-list";
import { getUserTransactions } from "../../../lib/firestore";

export default function Home() {
  const signer = useConnectedWallet();
  const [showModal, setShowModal] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const user = useUserStore((state) => state.user);
  const { contract } = useContract(GHO_SEPOLIA_ADDRESS);
  const { data: balanceData = BigNumber.from(0), refetch: balanceRefetch } =
    useContractRead(contract, "balanceOf", [user?.address]);
  const transactions = useTransactionsStore((state) => state.transactions);
  const setTransactions = useTransactionsStore(
    (state) => state.setTransactions
  );
  const balance = (balanceData / 10 ** 18).toFixed(2);

  const onRefresh = async () => {
    setRefreshing(true);
    setTransactions([]);
    try {
      await Promise.all([balanceRefetch(), fetchTransactions()]);
      Toast.show({
        type: "success",
        text1: "Refreshed!",
        text2: "Your balance and transactions have been refreshed.",
      });
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
            <Link href={"./settings"}>
              <Avatar name={user.username.charAt(0).toUpperCase()} />
            </Link>
            <Text className="text-[#C9B3F9] font-black text-3xl italic">
              GHOst
            </Text>
          </View>
          <View className="flex flex-row items-center">
            {!refreshing ? (
              <IconButton
                icon={() => <Icon source="refresh" color="#FFF" size={24} />}
                onPress={() => onRefresh()}
              />
            ) : (
              <View className="mr-4">
                <ActivityIndicator animating={true} color={"#FFF"} />
              </View>
            )}
            <IconButton
              icon={() => <Icon source="sign-out" color="#FFF" size={24} />}
              onPress={() => setShowModal(true)}
            />
          </View>
        </View>
        <View className="p-14">
          <ImageBackground
            source={require("../../../images/ghost.png")}
            className="flex flex-col space-y-4 py-8 bg-opacity-20"
            imageStyle={{ opacity: 0.1 }}
          >
            <Text className="text-white font-semibold text-center">
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
          </ImageBackground>
        </View>
        <TransactionsList
          transactions={transactions}
          loading={refreshing}
          setLoading={setRefreshing}
          setTransactions={setTransactions}
          getTransactions={getUserTransactions}
        />
      </View>
      <LogoutModal visible={showModal} hideModal={() => setShowModal(false)} />
    </SafeAreaView>
  );
}
