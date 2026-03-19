import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getApiBaseUrl, setApiBaseUrl, testConnection } from '../../services/api';

const PRESET_URLS = [
  {
    name: 'Android Emulator',
    url: 'http://10.0.2.2:8000/api/v1/',
    icon: 'phone-portrait',
    platform: 'android',
  },
  {
    name: 'iOS Simulator',
    url: 'http://localhost:8000/api/v1/',
    icon: 'logo-apple',
    platform: 'ios',
  },
  {
    name: 'Local Network (192.168.1.x)',
    url: 'http://192.168.1.100:8000/api/v1/',
    icon: 'wifi',
    platform: 'all',
  },
];

const ApiConfigScreen = ({ navigation }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [lastTested, setLastTested] = useState(null);

  useEffect(() => {
    loadCurrentUrl();
  }, []);

  const loadCurrentUrl = async () => {
    setLoading(true);
    try {
      const currentUrl = await getApiBaseUrl();
      setUrl(currentUrl);
      
      // Load last connection status
      const status = await AsyncStorage.getItem('connectionStatus');
      const tested = await AsyncStorage.getItem('lastTestedTime');
      if (status) setConnectionStatus(JSON.parse(status));
      if (tested) setLastTested(tested);
    } catch (error) {
      console.error('Failed to load URL:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (urlString) => {
    try {
      const pattern = /^https?:\/\/.+/;
      return pattern.test(urlString);
    } catch (error) {
      return false;
    }
  };

  const handleTestConnection = async () => {
    if (!validateUrl(url)) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    setTesting(true);
    setConnectionStatus(null);

    try {
      const result = await testConnection(url);
      const status = {
        success: result.success,
        message: result.message,
        timestamp: new Date().toISOString(),
      };

      setConnectionStatus(status);
      await AsyncStorage.setItem('connectionStatus', JSON.stringify(status));
      await AsyncStorage.setItem('lastTestedTime', new Date().toLocaleString());
      setLastTested(new Date().toLocaleString());

      if (result.success) {
        Alert.alert('Success!', result.message);
      } else {
        Alert.alert('Connection Failed', result.message);
      }
    } catch (error) {
      const status = {
        success: false,
        message: 'Connection test failed',
        timestamp: new Date().toISOString(),
      };
      setConnectionStatus(status);
      Alert.alert('Error', 'Failed to test connection');
    } finally {
      setTesting(false);
    }
  };

  const handleSaveUrl = async () => {
    if (!validateUrl(url)) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }

    setLoading(true);
    try {
      await setApiBaseUrl(url);
      Alert.alert(
        'Success',
        'API URL saved successfully! Please restart the app for changes to take effect.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save URL');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = (presetUrl) => {
    setUrl(presetUrl);
    setConnectionStatus(null);
  };

  if (loading && !url) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B9D" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="server" size={48} color="#FF6B9D" />
        <Text style={styles.title}>API Configuration</Text>
        <Text style={styles.subtitle}>Configure your backend server connection</Text>
      </View>

      {/* Connection Status */}
      {connectionStatus && (
        <View style={[
          styles.statusCard,
          connectionStatus.success ? styles.statusSuccess : styles.statusError
        ]}>
          <Ionicons
            name={connectionStatus.success ? 'checkmark-circle' : 'alert-circle'}
            size={24}
            color={connectionStatus.success ? '#10B981' : '#EF4444'}
          />
          <View style={styles.statusText}>
            <Text style={[
              styles.statusMessage,
              connectionStatus.success ? styles.textSuccess : styles.textError
            ]}>
              {connectionStatus.message}
            </Text>
            {lastTested && (
              <Text style={styles.statusTime}>Last tested: {lastTested}</Text>
            )}
          </View>
        </View>
      )}

      {/* URL Input */}
      <View style={styles.section}>
        <Text style={styles.label}>
          <Ionicons name="link" size={16} /> API Base URL
        </Text>
        <TextInput
          style={styles.input}
          placeholder="http://10.0.2.2:8000/api/v1"
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          placeholderTextColor="#9CA3AF"
        />
        <Text style={styles.hint}>
          Example: http://10.0.2.2:8000/api/v1 for Android emulator
        </Text>
      </View>

      {/* Test Connection Button */}
      <TouchableOpacity
        style={[styles.button, styles.testButton]}
        onPress={handleTestConnection}
        disabled={testing || !url}
      >
        {testing ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Testing Connection...</Text>
          </>
        ) : (
          <>
            <Ionicons name="flash" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Test Connection</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Preset URLs */}
      <View style={styles.section}>
        <Text style={styles.label}>
          <Ionicons name="bookmarks" size={16} /> Quick Presets
        </Text>
        {PRESET_URLS.map((preset, index) => (
          <TouchableOpacity
            key={index}
            style={styles.presetCard}
            onPress={() => handlePresetSelect(preset.url)}
          >
            <View style={styles.presetIcon}>
              <Ionicons name={preset.icon} size={24} color="#FF6B9D" />
            </View>
            <View style={styles.presetContent}>
              <Text style={styles.presetName}>{preset.name}</Text>
              <Text style={styles.presetUrl}>{preset.url}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[styles.button, styles.saveButton]}
        onPress={handleSaveUrl}
        disabled={loading || !url}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Saving...</Text>
          </>
        ) : (
          <>
            <Ionicons name="save" size={20} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Save Configuration</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color="#3B82F6" />
        <Text style={styles.infoText}>
          Make sure your backend server is running before testing the connection.
          The app will need to be restarted after changing the API URL.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  statusSuccess: {
    backgroundColor: '#D1FAE5',
  },
  statusError: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    flex: 1,
    marginLeft: 12,
  },
  statusMessage: {
    fontSize: 14,
    fontWeight: '600',
  },
  textSuccess: {
    color: '#065F46',
  },
  textError: {
    color: '#991B1B',
  },
  statusTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1F2937',
  },
  hint: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  testButton: {
    backgroundColor: '#3B82F6',
  },
  saveButton: {
    backgroundColor: '#FF6B9D',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  presetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  presetContent: {
    flex: 1,
  },
  presetName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  presetUrl: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    marginLeft: 12,
    lineHeight: 18,
  },
});

export default ApiConfigScreen;
