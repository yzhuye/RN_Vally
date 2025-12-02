import { createContext, useContext, useMemo } from "react";

import { TOKENS } from "./tokens";

import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { GetCurrentUserUseCase } from "@/src/features/auth/domain/usecases/GetCurrentUserUseCase";
import { GetUserIdByEmailUseCase } from "@/src/features/auth/domain/usecases/GetUserIdByEmailUseCase";
import { LoginUseCase } from "@/src/features/auth/domain/usecases/LoginUseCase";
import { LogoutUseCase } from "@/src/features/auth/domain/usecases/LogoutUseCase";
import { SignupUseCase } from "@/src/features/auth/domain/usecases/SignupUseCase";
import { Container } from "./container";

// Course import 
import { CourseRemoteDataSourceImp } from "@/src/features/course/data/datasources/course.remoteDataSourceImp";
import { CourseRepositoryImpl } from "@/src/features/course/data/repositories/course.repositoryImpl";
import { CreateCourseUseCase } from "@/src/features/course/domain/usecases/createCourse.usecases";
import { GetAllCoursesUseCase } from "@/src/features/course/domain/usecases/getAllCourses.usecases";
import { GetCourseByIdUseCase } from "@/src/features/course/domain/usecases/getCourse.usecases";
import { JoinCourseUseCase } from "@/src/features/course/domain/usecases/joinCourse.usecases";

// Category imports
import { CategoryRemoteDataSourceImpl } from "@/src/features/category/data/datasources/category.remoteDataSourceImp";
import { CategoryRepositoryImpl } from "@/src/features/category/data/repositories/category.repositoryImpl";
import { AddCategoryUseCase } from "@/src/features/category/domain/usecases/addCategory.usecase";
import { DeleteCategoryUseCase } from "@/src/features/category/domain/usecases/deleteCategory.usecase";
import { GetCategoriesUseCase } from "@/src/features/category/domain/usecases/getCategories.usecase";
import { UpdateCategoryUseCase } from "@/src/features/category/domain/usecases/updateCategory.usecase";

// Group imports
import { GroupRemoteDataSourceImpl } from "@/src/features/group/data/datasources/group.remoteDataSourceImp";
import { GroupRepositoryImpl } from "@/src/features/group/data/repositories/group.repositoryImpl";
import { AssignStudentToGroupUseCase } from "@/src/features/group/domain/usecases/assignStudentToGroup.usecase";
import { CreateGroupsForCategoryUseCase } from "@/src/features/group/domain/usecases/createGroupsForCategory.usecase";
import { FindStudentGroupUseCase } from "@/src/features/group/domain/usecases/findStudentGroup.usecase";
import { GetGroupsByCategoryUseCase } from "@/src/features/group/domain/usecases/getGroupsByCategory.usecase";
import { JoinGroupUseCase } from "@/src/features/group/domain/usecases/joinGroup.usecase";
import { MoveStudentToGroupUseCase } from "@/src/features/group/domain/usecases/moveStudentToGroup.usecase";

// Activity imports
import { ActivityRemoteDataSourceImpl } from "@/src/features/activity/data/datasources/activity.remoteDataSourceImp";
import { ActivityRepositoryImpl } from "@/src/features/activity/data/repositories/activity.repositoryImpl";
import { CreateActivityUseCase } from "@/src/features/activity/domain/usecases/createActivity.usecases";
import { DeleteActivityUseCase } from "@/src/features/activity/domain/usecases/deleteActivity.usecases";
import { GetActivitiesByCategoryUseCase } from "@/src/features/activity/domain/usecases/getActivityByCategory.usecases";
import { GetActivityByIdUseCase } from "@/src/features/activity/domain/usecases/getActivityById.usecases";
import { UpdateActivityUseCase } from "@/src/features/activity/domain/usecases/updateActivity.usecases";

// Evaluation imports
import { EvaluationRemoteDataSourceImpl } from "@/src/features/evaluation/data/datasources/evaluation.remoteDataSourceImpl";
import { EvaluationRepositoryImpl } from "@/src/features/evaluation/data/repositories/evaluation.repositoryImpl";
import { CheckEvaluationEligibilityUseCase } from "@/src/features/evaluation/domain/usecases/checkEvaluation.usecases";
import { CreateEvaluationUseCase } from "@/src/features/evaluation/domain/usecases/createEvaluation.usecases";
import { GetEvaluationsByActivityUseCase } from "@/src/features/evaluation/domain/usecases/getEvaluationByActivity.usecases";
import { UpdateEvaluationUseCase } from "@/src/features/evaluation/domain/usecases/updateEvaluation.usecases";


const DIContext = createContext<Container | null>(null);

export function DIProvider({ children }: { children: React.ReactNode }) {
    //useMemo is a React Hook that lets you cache the result of a calculation between re-renders.
    const container = useMemo(() => {
        const c = new Container();

        const authDS = new AuthRemoteDataSourceImpl();
        const authRepo = new AuthRepositoryImpl(authDS);

        c.register(TOKENS.AuthRemoteDS, authDS)
            .register(TOKENS.AuthRepo, authRepo)
            .register(TOKENS.LoginUC, new LoginUseCase(authRepo))
            .register(TOKENS.SignupUC, new SignupUseCase(authRepo))
            .register(TOKENS.LogoutUC, new LogoutUseCase(authRepo))
            .register(TOKENS.GetCurrentUserUC, new GetCurrentUserUseCase(authRepo))
            .register(TOKENS.GetUserIdByEmailUC, new GetUserIdByEmailUseCase(authRepo));

        // Course DI registrationS
        const courseRemoteDS = new CourseRemoteDataSourceImp(authDS);
        const courseRepo = new CourseRepositoryImpl(courseRemoteDS);

        c.register(TOKENS.CourseRemoteDS, courseRemoteDS)
            .register(TOKENS.CourseRepo, courseRepo)
            .register(TOKENS.CreateCourseUC, new CreateCourseUseCase(courseRepo))
            .register(TOKENS.GetAllCoursesUC, new GetAllCoursesUseCase(courseRepo))
            .register(TOKENS.GetCourseByIdUC, new GetCourseByIdUseCase(courseRepo))
            .register(TOKENS.JoinCourseUC, new JoinCourseUseCase(courseRepo));

        // Category DI registrations
        const categoryRemoteDS = new CategoryRemoteDataSourceImpl();
        const categoryRepo = new CategoryRepositoryImpl(categoryRemoteDS);

        c.register(TOKENS.CategoryRemoteDS, categoryRemoteDS)
            .register(TOKENS.CategoryRepo, categoryRepo)
            .register(TOKENS.GetCategoriesUC, new GetCategoriesUseCase(categoryRepo))
            .register(TOKENS.AddCategoryUC, new AddCategoryUseCase(categoryRepo))
            .register(TOKENS.UpdateCategoryUC, new UpdateCategoryUseCase(categoryRepo))
            .register(TOKENS.DeleteCategoryUC, new DeleteCategoryUseCase(categoryRepo));

        // Group DI registrations
        const groupRemoteDS = new GroupRemoteDataSourceImpl(authDS);
        const groupRepo = new GroupRepositoryImpl(groupRemoteDS);

        c.register(TOKENS.GroupRemoteDS, groupRemoteDS)
            .register(TOKENS.GroupRepo, groupRepo)
            .register(TOKENS.GetGroupsByCategoryUC, new GetGroupsByCategoryUseCase(groupRepo))
            .register(TOKENS.CreateGroupsForCategoryUC, new CreateGroupsForCategoryUseCase(groupRepo))
            .register(TOKENS.AssignStudentToGroupUC, new AssignStudentToGroupUseCase(groupRepo))
            .register(TOKENS.MoveStudentToGroupUC, new MoveStudentToGroupUseCase(groupRepo))
            .register(TOKENS.FindStudentGroupUC, new FindStudentGroupUseCase(groupRepo))
            .register(TOKENS.JoinGroupUC, new JoinGroupUseCase(groupRepo));

        // Activity DI registrations
        const activityRemoteDS = new ActivityRemoteDataSourceImpl(authDS);
        const activityRepo = new ActivityRepositoryImpl(activityRemoteDS);

        c.register(TOKENS.ActivityRemoteDS, activityRemoteDS)
            .register(TOKENS.ActivityRepo, activityRepo)
            .register(TOKENS.CreateActivityUC, new CreateActivityUseCase(activityRepo))
            .register(TOKENS.GetActivitiesByCategoryUC, new GetActivitiesByCategoryUseCase(activityRepo))
            .register(TOKENS.GetActivityByIdUC, new GetActivityByIdUseCase(activityRepo))
            .register(TOKENS.UpdateActivityUC, new UpdateActivityUseCase(activityRepo))
            .register(TOKENS.DeleteActivityUC, new DeleteActivityUseCase(activityRepo));

        // Evaluation DI registrations
        const evaluationRemoteDS = new EvaluationRemoteDataSourceImpl(authDS);
        const evaluationRepo = new EvaluationRepositoryImpl(evaluationRemoteDS);

        c.register(TOKENS.EvaluationRemoteDS, evaluationRemoteDS)
            .register(TOKENS.EvaluationRepo, evaluationRepo)
            .register(TOKENS.CreateEvaluationUC, new CreateEvaluationUseCase(evaluationRepo))
            .register(TOKENS.GetEvaluationsByActivityUC, new GetEvaluationsByActivityUseCase(evaluationRepo))
            .register(TOKENS.UpdateEvaluationUC, new UpdateEvaluationUseCase(evaluationRepo))
            .register(TOKENS.CheckEvaluationEligibilityUC, new CheckEvaluationEligibilityUseCase(evaluationRepo, activityRepo, groupRepo));

        return c;
    }, []);

    return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
    const c = useContext(DIContext);
    if (!c) throw new Error("DIProvider missing");
    return c;
}
