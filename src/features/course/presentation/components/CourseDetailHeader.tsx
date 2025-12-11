import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Course } from '../../domain/entities/course';

interface CourseDetailHeaderProps {
  course: Course;
  screenTitle: string;
}

const primaryColor = '#00BCD4';
const secondaryTextColor = '#757575';
const primaryTextColor = '#212121';
const backgroundColor = '#F5F7FA';

export function CourseDetailHeader({ course, screenTitle }: CourseDetailHeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* Header con botón de retroceso */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={24}
          iconColor={primaryTextColor}
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>{screenTitle}</Text>
        <View style={{ width: 48 }} />
      </View>

      {/* Información del curso */}
      <View style={styles.courseInfoContainer}>
        {course.imageUrl && (
          <Image
            source={{ uri: course.imageUrl }}
            style={styles.courseImage}
          />
        )}
        <View style={styles.courseTextContainer}>
          <Text style={styles.courseTitle}>{course.title}</Text>
          <Text style={styles.courseDescription} numberOfLines={2}>
            {course.description}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: backgroundColor,
    paddingTop: 40,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryTextColor,
    flex: 1,
    textAlign: 'center',
  },
  courseInfoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    alignItems: 'center',
  },
  courseImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  courseTextContainer: {
    flex: 1,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: primaryTextColor,
    marginBottom: 4,
  },
  courseDescription: {
    fontSize: 14,
    color: secondaryTextColor,
  },
});

