import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ProgressBarAndroid, ProgressViewIOS, Platform } from 'react-native'
import { useAppSelector, useAppDispatch } from '../store'
import { OfflineService, DownloadProgress, OfflineStats } from '../services/offlineService'
import { updateDownloadProgress, addToSyncQueue } from '../store/slices/offlineSlice'

const ProgressBar = Platform.OS === 'ios' ? ProgressViewIOS : ProgressBarAndroid

export const OfflineManager: React.FC = () => {
  const dispatch = useAppDispatch()
  const { display } = useAppSelector((state) => state.settings)
  const { downloadedContent, syncQueue } = useAppSelector((state) => state.offline)
  const { lessons } = useAppSelector((state) => state.lessons)
  
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null)
  const [offlineStats, setOfflineStats] = useState<OfflineStats | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  
  const isDark = display.theme === 'dark'

  useEffect(() => {
    loadOfflineStats()
  }, [])

  const loadOfflineStats = async () => {
    try {
      const stats = await OfflineService.getOfflineStats()
      setOfflineStats(stats)
    } catch (error) {
      console.error('Failed to load offline stats:', error)
    }
  }

  const handleDownloadEssentialContent = async () => {
    if (isDownloading) return

    try {
      setIsDownloading(true)
      
      // Get first 5 lessons for essential content
      const essentialLessons = lessons.slice(0, 5)
      
      if (essentialLessons.length === 0) {
        Alert.alert('No Content', 'No lessons available for download')
        return
      }

      Alert.alert(
        'Download Essential Content',
        `This will download audio and materials for ${essentialLessons.length} lessons. Continue?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              try {
                const downloadedContent = await OfflineService.downloadEssentialContent(essentialLessons)
                
                Alert.alert(
                  'Download Complete',
                  `Successfully downloaded ${downloadedContent.length} content items`
                )
                
                await loadOfflineStats()
              } catch (error: any) {
                Alert.alert('Download Failed', error.message)
              } finally {
                setIsDownloading(false)
                setDownloadProgress(null)
              }
            }
          }
        ]
      )
    } catch (error: any) {
      Alert.alert('Error', error.message)
      setIsDownloading(false)
    }
  }

  const handleSyncData = async () => {
    if (isSyncing || syncQueue.length === 0) return

    try {
      setIsSyncing(true)
      
      const success = await OfflineService.syncWhenOnline()
      
      if (success) {
        Alert.alert('Sync Complete', 'All data has been synchronized')
      } else {
        Alert.alert('Sync Partial', 'Some items could not be synchronized')
      }
      
      await loadOfflineStats()
    } catch (error: any) {
      Alert.alert('Sync Failed', error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleCleanupStorage = async () => {
    Alert.alert(
      'Cleanup Storage',
      'This will remove old, non-essential content to free up space. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Cleanup',
          onPress: async () => {
            try {
              const { removedContent, freedSpace } = await OfflineService.cleanupOldContent(downloadedContent)
              
              const freedMB = (freedSpace / (1024 * 1024)).toFixed(1)
              Alert.alert(
                'Cleanup Complete',
                `Removed ${removedContent.length} items and freed ${freedMB} MB`
              )
              
              await loadOfflineStats()
            } catch (error: any) {
              Alert.alert('Cleanup Failed', error.message)
            }
          }
        }
      ]
    )
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
    ]}>
      <Text style={[
        styles.title,
        { color: isDark ? '#ffffff' : '#1f2937' }
      ]}>
        Offline Content
      </Text>

      {/* Storage Stats */}
      {offlineStats && (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
              Downloaded Content:
            </Text>
            <Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1f2937' }]}>
              {offlineStats.contentCount} items ({formatBytes(offlineStats.totalSize)})
            </Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={[styles.statLabel, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
              Pending Sync:
            </Text>
            <Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1f2937' }]}>
              {offlineStats.pendingSyncItems} items
            </Text>
          </View>
          
          {offlineStats.lastSyncTime && (
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
                Last Sync:
              </Text>
              <Text style={[styles.statValue, { color: isDark ? '#ffffff' : '#1f2937' }]}>
                {new Date(offlineStats.lastSyncTime).toLocaleDateString()}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Download Progress */}
      {downloadProgress && (
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
            {downloadProgress.status === 'downloading' ? 'Downloading...' : downloadProgress.status}
          </Text>
          <ProgressBar
            style={styles.progressBar}
            progress={downloadProgress.progress / 100}
            color="#1e40af"
          />
          <Text style={[styles.progressPercent, { color: isDark ? '#d1d5db' : '#6b7280' }]}>
            {Math.round(downloadProgress.progress)}%
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.primaryButton,
            { opacity: isDownloading ? 0.6 : 1 }
          ]}
          onPress={handleDownloadEssentialContent}
          disabled={isDownloading}
        >
          <Text style={styles.primaryButtonText}>
            {isDownloading ? 'Downloading...' : 'Download Essential Content'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            { 
              borderColor: isDark ? '#374151' : '#d1d5db',
              opacity: isSyncing || syncQueue.length === 0 ? 0.6 : 1
            }
          ]}
          onPress={handleSyncData}
          disabled={isSyncing || syncQueue.length === 0}
        >
          <Text style={[
            styles.secondaryButtonText,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            {isSyncing ? 'Syncing...' : `Sync Data (${syncQueue.length})`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.secondaryButton,
            { borderColor: isDark ? '#374151' : '#d1d5db' }
          ]}
          onPress={handleCleanupStorage}
        >
          <Text style={[
            styles.secondaryButtonText,
            { color: isDark ? '#ffffff' : '#1f2937' }
          ]}>
            Cleanup Storage
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    marginBottom: 4,
  },
  progressPercent: {
    fontSize: 12,
    textAlign: 'right',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#1e40af',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
})
