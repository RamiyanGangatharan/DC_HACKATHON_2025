import { StyleSheet, Platform, SafeAreaView, View, Pressable, Alert, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { useRouter } from 'expo-router';
import * as FileSystem from "expo-file-system";
import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from '../_layout';

const filePath = `${FileSystem.documentDirectory}status.json`;

export default function TabTwoScreen() {
	const router = useRouter();
    const [status, setStatus] = useState('');
    const theme = useAppTheme();
    const saveStatus = async (newStatus: any) => {
        try {
            const fileExists = await FileSystem.getInfoAsync(filePath);
            let updatedData = fileExists.exists ? JSON.parse(await FileSystem.readAsStringAsync(filePath)) : [];
            updatedData.length > 0 ? (updatedData[0].status = newStatus) : updatedData.push({ status: newStatus });
            await FileSystem.writeAsStringAsync(filePath, JSON.stringify(updatedData, null, 2));
            console.log("Status saved:", newStatus);
        }
        catch (error) {
            console.error("Error writing to file:", error);
            Alert.alert("Error", "Failed to save data.");
        }
    };

    const handleStatusChange = (newStatus: any) => { setStatus(newStatus); saveStatus(newStatus); };

    const handleMedical = () => {
        Alert.alert(
            '',
            'Are you sure you want to declare a medical emergency?',
            [
                {
                    text: 'Cancel',
                    onPress: () => console.log('Cancel Pressed'),
                    style: 'cancel'
                },
                {
                    text: 'OK',
                    onPress: () => {
                        handleStatusChange("MEDICAL EMERGENCY");
                        router.push('/statusReason');
                    }
                },
            ],
            { cancelable: false }
        );
    };

    const handleAccident = () => {
        Alert.alert(
            '', 'Are you sure you want to declare an accident?',
            [
                { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                { text: 'OK', onPress: () => handleStatusChange("BUS INVOLVED IN ACCIDENT") },
            ],
            { cancelable: false }
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.tertiary }]}>
            <ThemedText type="title">DRT Driver Dashboard</ThemedText>
            <ThemedText type="subtitle">Bus Status: {status}</ThemedText>

            <View style={styles.buttonContainer }>
                <Pressable style={styles.dashButton} onPress={() => handleStatusChange("DETOUR")}>
                    <Text style={styles.buttonText}>DETOUR</Text>
                </Pressable>
                <Pressable style={styles.dashButton} onPress={() => handleStatusChange("DELAYED")}>
                    <Text style={styles.buttonText}>DELAY</Text>
                </Pressable>
                <Pressable style={styles.dashButton} onPress={() => handleStatusChange("EARLY, AHEAD OF SCHEDULE")}>
                    <Text style={styles.buttonText}>AHEAD OF SCHEDULE</Text>
                </Pressable>
                <Pressable style={styles.dashButton} onPress={() => handleStatusChange("SEVERE WEATHER")}>
                    <Text style={styles.buttonText}>SEVERE WEATHER</Text>
                </Pressable>
                <Pressable style={styles.dashButton} onPress={handleMedical}>
                    <Text style={styles.buttonText}>MEDICAL EMERGENCY</Text>
                </Pressable>
                <Pressable style={styles.dashButton} onPress={handleAccident}>
                    <Text style={styles.buttonText}>ACCIDENT</Text>
                </Pressable>
                <Pressable style={styles.dashButton} onPress={() => handleStatusChange("ALL CLEAR, OPERATIONAL")}>
                    <Text style={styles.buttonText}>All Clear</Text>
                </Pressable>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: Platform.OS === "android" ? 100 : 0,
    },
    buttonContainer: {
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 10,
    },
    dashButton: {
        width: "100%",
        height: 75,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        marginTop: 20,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
