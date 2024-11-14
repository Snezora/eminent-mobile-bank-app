import { Text, View, StyleSheet, Platform } from 'react-native';
import { Link } from 'expo-router'; 

export default function Index() {
  if (Platform.OS === 'web') {
    return (
      <div className=' w-[100%] flex justify-center text-center items-center'>
        <p className='text-center font-bold'>Text for web</p>
      </div>
    );
  }
  else if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return (
      <View >
        <Text>Home screen for phone</Text>
        <Link href="/about">
          Go to About screen
        </Link>
      </View>
    );
  }
}
