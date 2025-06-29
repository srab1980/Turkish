import React, { useState, useEffect } from 'react'
import { 
  View, 
  Text, 
  Switch, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Platform 
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DateTimePicker from '@react-native-community/datetimepicker'
import { NotificationService, ReminderSettings } from '../services/notificationService'
import { BackgroundTaskService } from '../services/backgroundTaskService'
import { useAppSelector } from '../store'

export const NotificationSettings: React.FC = () => {
  const { display } = useAppSelector((state) => state.settings)
  const isDark = display.theme === 'dark'

  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: true,
    dailyStudyTime: '19:00',
    streakReminders: true,
    lessonReminders: true,
    practiceReminders: true,
    weeklyGoalReminders: true,
  })

  const [showTimePicker, setShowTimePicker] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSyncStatus, setLastSyncStatus] = useState<any>(null)

  useEffect(() => {
    loadSettings()
    loadSyncStatus()
  }, [])

  const loadSettings = async () => {
    try {
      const reminderSettings = await NotificationService.getReminderSettings()
      setSettings(reminderSettings)
    } catch (error) {
      console.error('Failed to load notification settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSyncStatus = async () => {
    try {
      const status = await BackgroundTaskService.getLastSyncStatus()
      setLastSyncStatus(status)
    } catch (error) {
      console.error('Failed to load sync status:', error)
    }
  }

  const updateSettings = async (newSettings: Partial<ReminderSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings }
      setSettings(updatedSettings)
      await NotificationService.updateReminderSettings(updatedSettings)
      
      // Show confirmation
      Alert.alert('Settings Updated', 'Your notification preferences have been saved.')
    } catch (error) {
      console.error('Failed to update settings:', error)
      Alert.alert('Error', 'Failed to update notification settings.')
    }
  }

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios')
    
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0')
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0')
      const timeString = `${hours}:${minutes}`
      
      updateSettings({ dailyStudyTime: timeString })
    }
  }

  const requestPermissions = async () => {
    try {
      const granted = await NotificationService.requestPermissions()
      if (granted) {
        Alert.alert('Permissions Granted', 'You will now receive study reminders.')
        updateSettings({ enabled: true })
      } else {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive study reminders.'
        )
      }
    } catch (error) {
      console.error('Failed to request permissions:', error)
      Alert.alert('Error', 'Failed to request notification permissions.')
    }
  }

  const testNotification = async () => {
    try {
      await NotificationService.scheduleNotification({
        id: 'test_notification',
        title: '🎉 Test Notification',
        body: 'Your notifications are working perfectly!',
        trigger: { seconds: 2 },
        data: { type: 'test' },
      })
      
      Alert.alert('Test Sent', 'A test notification will appear in a few seconds.')
    } catch (error) {
      console.error('Failed to send test notification:', error)
      Alert.alert('Error', 'Failed to send test notification.')
    }
  }

  const forceSyncNow = async () => {
    try {
      setIsLoading(true)
      const result = await BackgroundTaskService.forceSyncNow()
      setLastSyncStatus(result)
      
      if (result.success) {
        Alert.alert('Sync Complete', `Successfully synced ${result.syncedItems} items.`)
      } else {
        Alert.alert('Sync Failed', `Sync completed with ${result.errors.length} errors.`)
      }
    } catch (error) {
      console.error('Failed to force sync:', error)
      Alert.alert('Error', 'Failed to sync data.')
    } finally {
      setIsLoading(false)
    }
  }

  const getTimeFromString = (timeString: string): Date => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  const formatLastSync = (timestamp: number): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={[styles.loadingText, { color: isDark ? '#ffffff' : '#1f2937' }]}>
          Loading settings...
        </Text>
      </View>
    )
  }

  return (
    <ScrollView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#f9fafb' }
    ]}>
      {/* Main Toggle */}
      <View style={[
        styles.section,
        { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
      ]}>
        <View style={styles.sectionHeader}>
          <Ionicons 
            name="notifications" 
            size={24} 
            color={isDark ? '#ffffff' : '#1f2937'} 
          />
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            Notifications
          </Text>
        </View>
        
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={[
              styles.settingTitle,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              Enable Notifications
            </Text>
            <Text style={[
              styles.settingDescription,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Receive study reminders and progress updates
            </Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={(value) => {
              if (value) {
                requestPermissions()
              } else {
                updateSettings({ enabled: false })
              }
            }}
            trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
            thumbColor={settings.enabled ? '#ffffff' : '#f3f4f6'}
          />
        </View>
      </View>

      {/* Study Time */}
      {settings.enabled && (
        <View style={[
          styles.section,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="time" 
              size={24} 
              color={isDark ? '#ffffff' : '#1f2937'} 
            />
            <Text style={[
              styles.sectionTitle,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              Study Time
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => setShowTimePicker(true)}
          >
            <View style={styles.settingInfo}>
              <Text style={[
                styles.settingTitle,
                { color: isDark ? '#ffffff' : '#1f2937' }
              ]}>
                Daily Study Reminder
              </Text>
              <Text style={[
                styles.settingDescription,
                { color: isDark ? '#d1d5db' : '#6b7280' }
              ]}>
                Get reminded to study at {settings.dailyStudyTime}
              </Text>
            </View>
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={isDark ? '#d1d5db' : '#6b7280'} 
            />
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={getTimeFromString(settings.dailyStudyTime)}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}
        </View>
      )}

      {/* Reminder Types */}
      {settings.enabled && (
        <View style={[
          styles.section,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="alarm" 
              size={24} 
              color={isDark ? '#ffffff' : '#1f2937'} 
            />
            <Text style={[
              styles.sectionTitle,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              Reminder Types
            </Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[
                styles.settingTitle,
                { color: isDark ? '#ffffff' : '#1f2937' }
              ]}>
                Streak Reminders
              </Text>
              <Text style={[
                styles.settingDescription,
                { color: isDark ? '#d1d5db' : '#6b7280' }
              ]}>
                Don't break your learning streak
              </Text>
            </View>
            <Switch
              value={settings.streakReminders}
              onValueChange={(value) => updateSettings({ streakReminders: value })}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={settings.streakReminders ? '#ffffff' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[
                styles.settingTitle,
                { color: isDark ? '#ffffff' : '#1f2937' }
              ]}>
                Lesson Reminders
              </Text>
              <Text style={[
                styles.settingDescription,
                { color: isDark ? '#d1d5db' : '#6b7280' }
              ]}>
                New lessons and content updates
              </Text>
            </View>
            <Switch
              value={settings.lessonReminders}
              onValueChange={(value) => updateSettings({ lessonReminders: value })}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={settings.lessonReminders ? '#ffffff' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[
                styles.settingTitle,
                { color: isDark ? '#ffffff' : '#1f2937' }
              ]}>
                Practice Reminders
              </Text>
              <Text style={[
                styles.settingDescription,
                { color: isDark ? '#d1d5db' : '#6b7280' }
              ]}>
                Review previous lessons
              </Text>
            </View>
            <Switch
              value={settings.practiceReminders}
              onValueChange={(value) => updateSettings({ practiceReminders: value })}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={settings.practiceReminders ? '#ffffff' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[
                styles.settingTitle,
                { color: isDark ? '#ffffff' : '#1f2937' }
              ]}>
                Weekly Goal Reminders
              </Text>
              <Text style={[
                styles.settingDescription,
                { color: isDark ? '#d1d5db' : '#6b7280' }
              ]}>
                Check your weekly progress
              </Text>
            </View>
            <Switch
              value={settings.weeklyGoalReminders}
              onValueChange={(value) => updateSettings({ weeklyGoalReminders: value })}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={settings.weeklyGoalReminders ? '#ffffff' : '#f3f4f6'}
            />
          </View>
        </View>
      )}

      {/* Background Sync */}
      <View style={[
        styles.section,
        { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
      ]}>
        <View style={styles.sectionHeader}>
          <Ionicons 
            name="sync" 
            size={24} 
            color={isDark ? '#ffffff' : '#1f2937'} 
          />
          <Text style={[
            styles.sectionTitle,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            Background Sync
          </Text>
        </View>
        
        {lastSyncStatus && (
          <View style={styles.syncStatus}>
            <Text style={[
              styles.syncStatusText,
              { color: isDark ? '#d1d5db' : '#6b7280' }
            ]}>
              Last sync: {formatLastSync(lastSyncStatus.timestamp)}
            </Text>
            <Text style={[
              styles.syncStatusText,
              { color: lastSyncStatus.success ? '#10b981' : '#ef4444' }
            ]}>
              {lastSyncStatus.success ? '✓ Success' : '✗ Failed'} 
              ({lastSyncStatus.syncedItems} items)
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: '#3b82f6' }
          ]}
          onPress={forceSyncNow}
          disabled={isLoading}
        >
          <Ionicons name="refresh" size={20} color="#ffffff" />
          <Text style={styles.actionButtonText}>
            {isLoading ? 'Syncing...' : 'Sync Now'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Test Notification */}
      {settings.enabled && (
        <View style={[
          styles.section,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: '#10b981' }
            ]}
            onPress={testNotification}
          >
            <Ionicons name="send" size={20} color="#ffffff" />
            <Text style={styles.actionButtonText}>
              Send Test Notification
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  section: {
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  syncStatus: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 8,
  },
  syncStatusText: {
    fontSize: 14,
    marginBottom: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
})
