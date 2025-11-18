import { createContext, useContext, useMemo } from "react";

import { TOKENS } from "./tokens";

import { AuthRemoteDataSourceImpl } from "@/src/features/auth/data/datasources/AuthRemoteDataSourceImp";
import { AuthRepositoryImpl } from "@/src/features/auth/data/repositories/AuthRepositoryImpl";
import { GetCurrentUserUseCase } from "@/src/features/auth/domain/usecases/GetCurrentUserUseCase";
import { LoginUseCase } from "@/src/features/auth/domain/usecases/LoginUseCase";
import { LogoutUseCase } from "@/src/features/auth/domain/usecases/LogoutUseCase";
import { SignupUseCase } from "@/src/features/auth/domain/usecases/SignupUseCase";
import { ProductRemoteDataSourceImp } from "@/src/features/products/data/datasources/ProductRemoteDataSourceImp";
import { ProductRepositoryImpl } from "@/src/features/products/data/repositories/ProductRepositoryImpl";
import { AddProductUseCase } from "@/src/features/products/domain/usecases/AddProductUseCase";
import { DeleteProductUseCase } from "@/src/features/products/domain/usecases/DeleteProductUseCase";
import { GetProductByIdUseCase } from "@/src/features/products/domain/usecases/GetProductByIdUseCase";
import { GetProductsUseCase } from "@/src/features/products/domain/usecases/GetProductsUseCase";
import { UpdateProductUseCase } from "@/src/features/products/domain/usecases/UpdateProductUseCase";
import { Container } from "./container";

// Course import 
import { CourseRemoteDataSourceImp } from "@/src/features/course/data/datasources/course.remoteDataSourceImp";
import { CourseRepositoryImpl } from "@/src/features/course/data/repositories/course.repositoryImpl";
import { CreateCourseUseCase } from "@/src/features/course/domain/usecases/createCourse.usecases";
import { GetAllCoursesUseCase } from "@/src/features/course/domain/usecases/getAllCourses.usecases";
import { GetCourseByIdUseCase } from "@/src/features/course/domain/usecases/getCourse.usecases";
import { JoinCourseUseCase } from "@/src/features/course/domain/usecases/joinCourse.usecases";

// Group imports
import { GroupRemoteDataSourceImpl } from "@/src/features/groups/data/datasources/group.remoteDataSourceImpl";
import { AssignStudentToGroupUseCase } from "@/src/features/groups/domain/usecases/assignStudentToGroup.usecases";
import { CreateGroupsForCategoryUseCase } from "@/src/features/groups/domain/usecases/createGroupForCategory.usecases";
import { FindStudentGroupUseCase } from "@/src/features/groups/domain/usecases/findStudentGroup.usecases";
import { GetGroupsByCategoryUseCase } from "@/src/features/groups/domain/usecases/getGroupsByCategory.usecases";
import { JoinGroupUseCase } from "@/src/features/groups/domain/usecases/joinGroup.usecases";
import { MoveStudentToGroupUseCase } from "@/src/features/groups/domain/usecases/moveStutendToGroup.usecases";

// Category imports
import { CategoryRemoteDataSourceImpl } from "@/src/features/category/data/datasources/category.remoteDataSourceImp";
import { AddCategoryUseCase } from "@/src/features/category/domain/usecases/addCategory.usecase";
import { DeleteCategoryUseCase } from "@/src/features/category/domain/usecases/deleteCategory.usecase";
import { GetCategoriesUseCase } from "@/src/features/category/domain/usecases/getCategories.usecase";
import { UpdateCategoryUseCase } from "@/src/features/category/domain/usecases/updateCategory.usecase";
import { CategoryRepositoryImpl } from "@/src/features/course/data/repositories/category.repositoryImpl";

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


        const productRemoteDS = new ProductRemoteDataSourceImp(authDS);
        const productRepo = new ProductRepositoryImpl(productRemoteDS);

        c.register(TOKENS.ProductRemoteDS, productRemoteDS)
            .register(TOKENS.ProductRepo, productRepo).register(TOKENS.AddProductUC, new AddProductUseCase(productRepo))
            .register(TOKENS.UpdateProductUC, new UpdateProductUseCase(productRepo))
            .register(TOKENS.DeleteProductUC, new DeleteProductUseCase(productRepo))
            .register(TOKENS.GetProductsUC, new GetProductsUseCase(productRepo))
            .register(TOKENS.GetProductByIdUC, new GetProductByIdUseCase(productRepo));

        // Course DI registrationS
        const courseRemoteDS = new CourseRemoteDataSourceImp(authDS);
        const courseRepo = new CourseRepositoryImpl(courseRemoteDS);

        c.register(TOKENS.CourseRemoteDS, courseRemoteDS)
            .register(TOKENS.CourseRepo, courseRepo)
            .register(TOKENS.CreateCourseUC, new CreateCourseUseCase(courseRepo))
            .register(TOKENS.GetAllCoursesUC, new GetAllCoursesUseCase(courseRepo))
            .register(TOKENS.GetCourseByIdUC, new GetCourseByIdUseCase(courseRepo))
            .register(TOKENS.JoinCourseUC, new JoinCourseUseCase(courseRepo));

        // Group DI registrations
        const groupRemoteDS = new GroupRemoteDataSourceImpl(authDS);
        // Category DI registrations
        const categoryRemoteDS = new CategoryRemoteDataSourceImpl();
        const categoryRepo = new CategoryRepositoryImpl(categoryRemoteDS);

        c.register(TOKENS.CategoryRemoteDS, categoryRemoteDS)
            .register(TOKENS.CategoryRepo, categoryRepo)
            .register(TOKENS.GetCategoriesUC, new GetCategoriesUseCase(categoryRepo))
            .register(TOKENS.AddCategoryUC, new AddCategoryUseCase(categoryRepo))
            .register(TOKENS.UpdateCategoryUC, new UpdateCategoryUseCase(categoryRepo))
            .register(TOKENS.DeleteCategoryUC, new DeleteCategoryUseCase(categoryRepo));

        c.register(TOKENS.GroupRemoteDS, groupRemoteDS)
            .register(TOKENS.GroupRepo, groupRepo)
            .register(TOKENS.GetGroupsByCategoryUC, new GetGroupsByCategoryUseCase(groupRepo))
            .register(TOKENS.JoinGroupUC, new JoinGroupUseCase(groupRepo))
            .register(TOKENS.CreateGroupsForCategoryUC, new CreateGroupsForCategoryUseCase(groupRepo))
            .register(TOKENS.AssignStudentToGroupUC, new AssignStudentToGroupUseCase(groupRepo))
            .register(TOKENS.FindStudentGroupUC, new FindStudentGroupUseCase(groupRepo))
            .register(TOKENS.MoveStudentToGroupUC, new MoveStudentToGroupUseCase(groupRepo));

        return c;
    }, []);

    return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useDI() {
    const c = useContext(DIContext);
    if (!c) throw new Error("DIProvider missing");
    return c;
}
