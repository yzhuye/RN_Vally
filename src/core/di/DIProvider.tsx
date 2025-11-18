import { createContext, useContext, useMemo } from "react";

import { TOKENS } from "./tokens";

import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { GetCurrentUserUseCase } from "@/src/features/auth/domain/usecases/GetCurrentUserUseCase";
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
import { CategoryRemoteDataSourceImpl } from "@/src/features/course/data/datasources/category.remoteDataSourceImp";
import { CategoryRepositoryImpl } from "@/src/features/course/data/repositories/category.repositoryImpl";
import { GetCategoriesUseCase } from "@/src/features/course/domain/usecases/getCategories.usecase";
import { AddCategoryUseCase } from "@/src/features/course/domain/usecases/addCategory.usecase";
import { UpdateCategoryUseCase } from "@/src/features/course/domain/usecases/updateCategory.usecase";
import { DeleteCategoryUseCase } from "@/src/features/course/domain/usecases/deleteCategory.usecase";

// Group imports
import { GroupRemoteDataSourceImpl } from "@/src/features/course/data/datasources/group.remoteDataSourceImp";
import { GroupRepositoryImpl } from "@/src/features/course/data/repositories/group.repositoryImpl";
import { GetGroupsByCategoryUseCase } from "@/src/features/course/domain/usecases/getGroupsByCategory.usecase";
import { CreateGroupsForCategoryUseCase } from "@/src/features/course/domain/usecases/createGroupsForCategory.usecase";
import { AssignStudentToGroupUseCase } from "@/src/features/course/domain/usecases/assignStudentToGroup.usecase";
import { MoveStudentToGroupUseCase } from "@/src/features/course/domain/usecases/moveStudentToGroup.usecase";
import { FindStudentGroupUseCase } from "@/src/features/course/domain/usecases/findStudentGroup.usecase";


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
            .register(TOKENS.GetCurrentUserUC, new GetCurrentUserUseCase(authRepo));

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
        const groupRemoteDS = new GroupRemoteDataSourceImpl();
        const groupRepo = new GroupRepositoryImpl(groupRemoteDS);

        c.register(TOKENS.GroupRemoteDS, groupRemoteDS)
            .register(TOKENS.GroupRepo, groupRepo)
            .register(TOKENS.GetGroupsByCategoryUC, new GetGroupsByCategoryUseCase(groupRepo))
            .register(TOKENS.CreateGroupsForCategoryUC, new CreateGroupsForCategoryUseCase(groupRepo))
            .register(TOKENS.AssignStudentToGroupUC, new AssignStudentToGroupUseCase(groupRepo))
            .register(TOKENS.MoveStudentToGroupUC, new MoveStudentToGroupUseCase(groupRepo))
            .register(TOKENS.FindStudentGroupUC, new FindStudentGroupUseCase(groupRepo));

        return c;
    }, []);

    return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
    const c = useContext(DIContext);
    if (!c) throw new Error("DIProvider missing");
    return c;
}
