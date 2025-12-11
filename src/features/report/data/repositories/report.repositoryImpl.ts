import { ActivityRepository } from '../../../activity/domain/repositories/activity.repository';
import { AuthRepository } from '../../../auth/domain/repositories/AuthRepository';
import { EvaluationRepository } from '../../../evaluation/domain/repositories/evaluation.repository';
import { GroupRepository } from '../../../group/domain/repositories/group.repository';
import { ActivityReport, GroupReport, StudentReport } from '../../domain/entities/reportTypes';
import { ReportRepository } from '../../domain/repositories/report.repository';

export class ReportRepositoryImpl implements ReportRepository {
  constructor(
    private evaluationRepository: EvaluationRepository,
    private activityRepository: ActivityRepository,
    private groupRepository: GroupRepository,
    private authRepository: AuthRepository
  ) {}

  async getActivityReports(categoryId: string): Promise<{ isSuccess: boolean; message: string; data?: ActivityReport[] }> {
    try {
      // Get all activities for this category
      const activities = await this.activityRepository.getActivitiesByCategory(categoryId);
      
      if (!activities || activities.length === 0) {
        return {
          isSuccess: true,
          message: 'No activities found for this category',
          data: []
        };
      }

      const reports: ActivityReport[] = [];

      for (const activity of activities) {
        // Get all evaluations for this activity
        const evaluations = await this.evaluationRepository.getEvaluationsByActivity(activity.id);
        
        if (!evaluations || evaluations.length === 0) {
          reports.push({
            activityId: activity.id,
            activityName: activity.name,
            averageScore: 0,
            evaluationCount: 0,
          });
          continue;
        }

        // Calculate average score across all evaluations
        const totalScore = evaluations.reduce((sum: number, evaluation: any) => {
          const evalAverage = (evaluation.punctuality + evaluation.contributions + 
                             evaluation.commitment + evaluation.attitude) / 4;
          return sum + evalAverage;
        }, 0);

        const averageScore = totalScore / evaluations.length;

        reports.push({
          activityId: activity.id,
          activityName: activity.name,
          averageScore: averageScore,
          evaluationCount: evaluations.length,
        });
      }

      return {
        isSuccess: true,
        message: 'Activity reports retrieved successfully',
        data: reports
      };
    } catch (error) {
      console.error('Error getting activity reports:', error);
      return {
        isSuccess: false,
        message: error instanceof Error ? error.message : 'Failed to get activity reports'
      };
    }
  }

  async getGroupReports(categoryId: string): Promise<{ isSuccess: boolean; message: string; data?: GroupReport[] }> {
    try {
      // Get all groups for this category
      const groups = await this.groupRepository.getGroupsByCategory(categoryId);
      
      if (!groups || groups.length === 0) {
        return {
          isSuccess: true,
          message: 'No groups found for this category',
          data: []
        };
      }

      const reports: GroupReport[] = [];

      for (const group of groups) {
        // Convert group member emails to user IDs for comparison
        const memberIds: string[] = [];
        for (const member of group.members) {
          try {
            // If member looks like an email, convert to ID
            if (member.includes('@')) {
              const userId = await this.authRepository.getUserIdByEmail(member);
              if (userId) {
                memberIds.push(userId);
              } else {
                // Keep the original email as fallback
                memberIds.push(member);
              }
            } else {
              // Already an ID
              memberIds.push(member);
            }
          } catch (error) {
            console.log('Could not resolve user ID for member:', member);
            // Keep the original value as fallback
            memberIds.push(member);
          }
        }
        
        // Get all activities for this category
        const activities = await this.activityRepository.getActivitiesByCategory(categoryId);
        
        let totalScore = 0;
        let totalEvaluations = 0;

        // For each activity, get evaluations where the evaluated person is in this group
        for (const activity of activities) {
          const evaluations = await this.evaluationRepository.getEvaluationsByActivity(activity.id);
          
          // Filter evaluations for group members using resolved IDs
          const groupEvaluations = evaluations.filter((evaluation: any) => 
            memberIds.includes(evaluation.evaluatedId)
          );

          // Calculate total scores for this group in this activity
          for (const evaluation of groupEvaluations) {
            const evalAverage = ((evaluation as any).punctuality + (evaluation as any).contributions + 
                               (evaluation as any).commitment + (evaluation as any).attitude) / 4;
            totalScore += evalAverage;
            totalEvaluations++;
          }
        }

        const averageScore = totalEvaluations > 0 ? totalScore / totalEvaluations : 0;

        reports.push({
          groupId: group.id,
          groupName: group.name,
          averageScore: averageScore,
          memberCount: group.members.length,
        });
      }

      return {
        isSuccess: true,
        message: 'Group reports retrieved successfully',
        data: reports
      };
    } catch (error) {
      console.error('Error getting group reports:', error);
      return {
        isSuccess: false,
        message: error instanceof Error ? error.message : 'Failed to get group reports'
      };
    }
  }

  async getStudentReports(categoryId: string): Promise<{ isSuccess: boolean; message: string; data?: StudentReport[] }> {
    try {
      // Get all groups for this category to find all students
      const groups = await this.groupRepository.getGroupsByCategory(categoryId);
      
      if (!groups || groups.length === 0) {
        return {
          isSuccess: true,
          message: 'No groups found for this category',
          data: []
        };
      }

      const studentEmails = new Set<string>();
      
      // Collect all unique student emails from all groups
      groups.forEach(group => {
        group.members.forEach(member => studentEmails.add(member));
      });

      const reports: StudentReport[] = [];

      for (const studentEmail of studentEmails) {
        // Get all activities for this category
        const activities = await this.activityRepository.getActivitiesByCategory(categoryId);
        
        let totalScore = 0;
        let totalEvaluations = 0;

        // For each activity, find evaluations where this student was evaluated
        for (const activity of activities) {
          const evaluations = await this.evaluationRepository.getEvaluationsByActivity(activity.id);
          
          // Try to get user ID from email first, fallback to email matching
          let studentId: string | null = null;
          try {
            studentId = await this.authRepository.getUserIdByEmail(studentEmail);
          } catch (error) {
            console.log('Could not resolve user ID for:', studentEmail);
          }

          // Filter evaluations for this student (by ID or email)
          const studentEvaluations = evaluations.filter((evaluation: any) => 
            evaluation.evaluatedId === (studentId || studentEmail)
          );

          // Calculate total scores for this student in this activity
          for (const evaluation of studentEvaluations) {
            const evalAverage = ((evaluation as any).punctuality + (evaluation as any).contributions + 
                               (evaluation as any).commitment + (evaluation as any).attitude) / 4;
            totalScore += evalAverage;
            totalEvaluations++;
          }
        }

        const averageScore = totalEvaluations > 0 ? totalScore / totalEvaluations : 0;

        reports.push({
          studentEmail: studentEmail,
          averageScore: averageScore,
          evaluationCount: totalEvaluations,
        });
      }

      // Sort by average score descending
      const sortedReports = reports.sort((a, b) => b.averageScore - a.averageScore);
      
      return {
        isSuccess: true,
        message: 'Student reports retrieved successfully',
        data: sortedReports
      };
    } catch (error) {
      console.error('Error getting student reports:', error);
      return {
        isSuccess: false,
        message: error instanceof Error ? error.message : 'Failed to get student reports'
      };
    }
  }
}
