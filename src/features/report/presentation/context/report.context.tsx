import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import React, { createContext, ReactNode, useContext } from 'react';
import { ActivityReport, GroupReport, StudentReport } from '../../domain/entities/reportTypes';
import { GetActivityReportsUseCase } from '../../domain/usecases/getActivityReports.usecases';
import { GetGroupReportsUseCase } from '../../domain/usecases/getGroupReports.usecases';
import { GetStudentReportsUseCase } from '../../domain/usecases/getStudentReports.usecases';

interface ReportContextType {
  getActivityReports: (categoryId: string) => Promise<{ isSuccess: boolean; message: string; data?: ActivityReport[] }>;
  getGroupReports: (categoryId: string) => Promise<{ isSuccess: boolean; message: string; data?: GroupReport[] }>;
  getStudentReports: (categoryId: string) => Promise<{ isSuccess: boolean; message: string; data?: StudentReport[] }>;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReport = (): ReportContextType => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
};

interface ReportProviderProps {
  children: ReactNode;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
  const di = useDI();

  const getActivityReportsUC = di.resolve<GetActivityReportsUseCase>(TOKENS.GetActivityReportsUC);
  const getGroupReportsUC = di.resolve<GetGroupReportsUseCase>(TOKENS.GetGroupReportsUC);
  const getStudentReportsUC = di.resolve<GetStudentReportsUseCase>(TOKENS.GetStudentReportsUC);

  const getActivityReports = async (categoryId: string) => {
    try {
      const result = await getActivityReportsUC.execute(categoryId);
      return result;
    } catch (error) {
      console.error('Error getting activity reports:', error);
      return {
        isSuccess: false,
        message: error instanceof Error ? error.message : 'Failed to get activity reports'
      };
    }
  };

  const getGroupReports = async (categoryId: string) => {
    try {
      const result = await getGroupReportsUC.execute(categoryId);
      return result;
    } catch (error) {
      console.error('Error getting group reports:', error);
      return {
        isSuccess: false,
        message: error instanceof Error ? error.message : 'Failed to get group reports'
      };
    }
  };

  const getStudentReports = async (categoryId: string) => {
    try {
      const result = await getStudentReportsUC.execute(categoryId);
      return result;
    } catch (error) {
      console.error('Error getting student reports:', error);
      return {
        isSuccess: false,
        message: error instanceof Error ? error.message : 'Failed to get student reports'
      };
    }
  };

  const contextValue: ReportContextType = {
    getActivityReports,
    getGroupReports,
    getStudentReports,
  };

  return (
    <ReportContext.Provider value={contextValue}>
      {children}
    </ReportContext.Provider>
  );
};
