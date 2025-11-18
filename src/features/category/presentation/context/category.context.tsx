import { useDI } from '@/src/core/di/DIProvider';
import { TOKENS } from '@/src/core/di/tokens';
import { CreateGroupsForCategoryUseCase } from '@/src/features/group/domain/usecases/createGroupsForCategory.usecase';
import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { Category } from '../../../category/domain/entities/category';
import { AddCategoryUseCase } from '../../../category/domain/usecases/addCategory.usecase';
import { DeleteCategoryUseCase } from '../../../category/domain/usecases/deleteCategory.usecase';
import { GetCategoriesUseCase } from '../../../category/domain/usecases/getCategories.usecase';
import { UpdateCategoryUseCase } from '../../../category/domain/usecases/updateCategory.usecase';

type CategoryContextType = {
  categories: Category[];
  isLoading: boolean;
  loadCategories: (courseId: string) => Promise<void>;
  addCategory: (courseId: string, name: string, groupingMethod: string, groupCount: number, studentsPerGroup: number) => Promise<void>;
  updateCategory: (courseId: string, category: Category) => Promise<void>;
  deleteCategory: (courseId: string, categoryId: string) => Promise<void>;
  getMethodDisplayName: (method: string) => string;
  getMethodIcon: (method: string) => string;
};

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const di = useDI();

  const getCategoriesUseCase = di.resolve<GetCategoriesUseCase>(TOKENS.GetCategoriesUC);
  const addCategoryUseCase = di.resolve<AddCategoryUseCase>(TOKENS.AddCategoryUC);
  const updateCategoryUseCase = di.resolve<UpdateCategoryUseCase>(TOKENS.UpdateCategoryUC);
  const deleteCategoryUseCase = di.resolve<DeleteCategoryUseCase>(TOKENS.DeleteCategoryUC);
  const createGroupsUseCase = di.resolve<CreateGroupsForCategoryUseCase>(TOKENS.CreateGroupsForCategoryUC);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadCategories = async (courseId: string) => {
    setIsLoading(true);
    try {
      const categoriesData = await getCategoriesUseCase.execute(courseId);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'No se pudieron cargar las categorías');
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (
    courseId: string,
    name: string,
    groupingMethod: string,
    groupCount: number,
    studentsPerGroup: number
  ) => {
    setIsLoading(true);
    try {
      const result = await addCategoryUseCase.execute(courseId, name, groupingMethod, groupCount, studentsPerGroup);
      if (result.isSuccess && result.category) {
        await loadCategories(courseId);
        // Crear grupos para la nueva categoría
        
        const groupsResult = await createGroupsUseCase.execute(
          result.category.id,
          groupCount,
          studentsPerGroup,
          name
        );  

        if (groupsResult.isSuccess) {
          await loadCategories(courseId);
          Alert.alert('Éxito', 'Categoría y grupos creados exitosamente');
        } else {
          Alert.alert('Advertencia', `Categoría creada pero error al crear grupos: ${groupsResult.message}`);
        }
        
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error adding category:', error);
      Alert.alert('Error', 'Error al crear la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  const updateCategory = async (courseId: string, category: Category) => {
    setIsLoading(true);
    try {
      const result = await updateCategoryUseCase.execute(courseId, category);

      if (result.isSuccess) {
        await loadCategories(courseId);
        Alert.alert('Éxito', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      Alert.alert('Error', 'Error al actualizar la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (courseId: string, categoryId: string) => {
    setIsLoading(true);
    try {
      const result = await deleteCategoryUseCase.execute(courseId, categoryId);

      if (result.isSuccess) {
        await loadCategories(courseId);
        Alert.alert('Éxito', result.message);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      Alert.alert('Error', 'Error al eliminar la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  const getMethodDisplayName = (method: string): string => {
    switch (method) {
      case 'self-assigned':
        return 'Auto-asignado';
      case 'manual':
        return 'Manual';
      default:
        return method;
    }
  };

  const getMethodIcon = (method: string): string => {
    switch (method) {
      case 'self-assigned':
        return 'account-plus';
      case 'manual':
        return 'pencil';
      default:
        return 'help-circle';
    }
  };

  const value = {
    categories,
    isLoading,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    getMethodDisplayName,
    getMethodIcon,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategory must be used inside CategoryProvider');
  }
  return context;
}

