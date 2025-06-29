import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { useAppSelector } from '../store'

export const ProfileScreen: React.FC = () => {
  const { display } = useAppSelector((state) => state.settings)
  const { user } = useAppSelector((state) => state.auth)
  const { overallStats } = useAppSelector((state) => state.progress)
  
  const isDark = display.theme === 'dark'
  
  return (
    <ScrollView style={[
      styles.container,
      { backgroundColor: isDark ? '#111827' : '#f9fafb' }
    ]}>
      {/* Profile Header */}
      <View style={[
        styles.header,
        { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
      ]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </View>
        
        <Text style={[
          styles.userName,
          { color: isDark ? '#ffffff' : '#1f2937' }
        ]}>
          {user?.name || 'User'}
        </Text>
        
        <Text style={[
          styles.userEmail,
          { color: isDark ? '#d1d5db' : '#6b7280' }
        ]}>
          {user?.email || 'user@example.com'}
        </Text>
        
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>Level {user?.level || 'A1'}</Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={[
          styles.quickStatCard,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <Text style={styles.quickStatNumber}>{overallStats.currentStreak}</Text>
          <Text style={[
            styles.quickStatLabel,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            Day Streak
          </Text>
        </View>
        
        <View style={[
          styles.quickStatCard,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <Text style={styles.quickStatNumber}>{overallStats.totalXP}</Text>
          <Text style={[
            styles.quickStatLabel,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            Total XP
          </Text>
        </View>
        
        <View style={[
          styles.quickStatCard,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <Text style={styles.quickStatNumber}>{overallStats.lessonsCompleted}</Text>
          <Text style={[
            styles.quickStatLabel,
            { color: isDark ? '#d1d5db' : '#6b7280' }
          ]}>
            Lessons
          </Text>
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.content}>
        <View style={[
          styles.menuSection,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>👤</Text>
            <Text style={[
              styles.menuText,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              Edit Profile
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>⚙️</Text>
            <Text style={[
              styles.menuText,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              Settings
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🏆</Text>
            <Text style={[
              styles.menuText,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              Achievements
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📊</Text>
            <Text style={[
              styles.menuText,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              Statistics
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={[
          styles.menuSection,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>❓</Text>
            <Text style={[
              styles.menuText,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              Help & Support
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>📝</Text>
            <Text style={[
              styles.menuText,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              Feedback
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>ℹ️</Text>
            <Text style={[
              styles.menuText,
              { color: isDark ? '#ffffff' : '#1f2937' }
            ]}>
              About
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={[
          styles.menuSection,
          { backgroundColor: isDark ? '#1f2937' : '#ffffff' }
        ]}>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuIcon}>🚪</Text>
            <Text style={[
              styles.menuText,
              { color: '#ef4444' }
            ]}>
              Sign Out
            </Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e40af',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickStatNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
  },
  menuSection: {
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
})
