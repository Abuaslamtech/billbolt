import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "@react-native-firebase/auth";
import {
  AuthorizationStatus,
  getMessaging,
  onTokenRefresh,
  getToken as getFcmToken,
  requestPermission as requestFcmPermission,
  onMessage as onFcmMessage,
  setBackgroundMessageHandler,
  onNotificationOpenedApp,
  getInitialNotification,
  registerDeviceForRemoteMessages,
} from "@react-native-firebase/messaging";
import { Alert, PermissionsAndroid, Platform } from "react-native";

const messaging = getMessaging();

// request notification permissions
export const requestPermission = async () => {
  try {
    // Android Permission
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: "Notification Permission",
          message: "This app needs permission to show notifications",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      return granted === PermissionsAndroid.RESULTS.GRANTED;

      // IOS permission
    } else if (Platform.OS === "ios") {
      const authStatus = await requestFcmPermission(messaging);
      return (
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL
      );
    }
    return false;
  } catch (error) {
    console.log("Permission error:", error);
    return false;
  }
};

// get and store FCM token
export const getToken = async () => {
  try {
    await registerDeviceForRemoteMessages(messaging);
    const token = await getFcmToken(messaging);
    console.log("FCM TOKEN: ", token);
    if (token) {
      await AsyncStorage.setItem("token", token);
    }
    return token;
  } catch (error) {
    console.log("Error getting FCM Token: ", error);
    return null;
  }
};

// set-up foreground notification
export const foregroundNotificationListener = () => {
  return onFcmMessage(messaging, async (remoteMessage) => {
    console.log("Foreground Notification", remoteMessage);

    Alert.alert(
      remoteMessage?.notification?.title || "New Notification",
      remoteMessage?.notification?.body || "Notification Body"
    );
  });
};

// set-up background notification
export const backgroundNotificationListener = () => {
  return setBackgroundMessageHandler(messaging, async (remoteMessage) => {
    console.log("Background Notification: ", remoteMessage);
  });
};

// set-up notification that opened the app
export const notificationOpenedListener = () => {
  // app opened from foreground notification
  getInitialNotification(messaging)
    .then((remoteMessage) => {
      if (remoteMessage) {
        console.log("App opened from notification foreground: ", remoteMessage);
      }
    })
    .catch((error) => {
      console.log("Error getting initial notification: ", error);
    });
  // app opened from background
  return onNotificationOpenedApp(messaging, (remoteMessage) => {
    console.log("App opened from notification background: ", remoteMessage);
  });
};

// set-up token refresh (modular v22 syntax)
export const tokenRefresh = () => {
  return onTokenRefresh(messaging, async (token) => {
    console.log("token refreshed ", token);
    if (token) {
      await AsyncStorage.setItem("token", token);
    }
  });
};

// get stored token
export const getStoredToken = async () => {
  try {
    return await AsyncStorage.getItem("token");
  } catch (error) {
    console.log("Error getting token: ", error);
    return null;
  }
};

export const initializeNotification = async () => {
  // Check token passively if already granted
  try {
    await getToken();
  } catch (e) {
    // ignore
  }

  // start background notification listeners
  backgroundNotificationListener();
  const foreground = foregroundNotificationListener();
  const opened = notificationOpenedListener();
  const refreshed = tokenRefresh();

  return {
    foregroundUnsubscribe: foreground,
    notificationOpenedUnsubscribe: opened,
    tokenRefreshUnsubscribe: refreshed,
  };
};

export { auth, messaging };
