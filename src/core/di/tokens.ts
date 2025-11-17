export const TOKENS = {
  AuthRemoteDS: Symbol("AuthRemoteDS"),
  AuthRepo: Symbol("AuthRepo"),
  LoginUC: Symbol("LoginUC"),
  SignupUC: Symbol("SignupUC"),
  LogoutUC: Symbol("LogoutUC"),
  GetCurrentUserUC: Symbol("GetCurrentUserUC"),
  ProductRemoteDS: Symbol("ProductRemoteDS"),
  ProductRepo: Symbol("ProductRepo"),
  AddProductUC: Symbol("AddProductUC"),
  UpdateProductUC: Symbol("UpdateProductUC"),
  DeleteProductUC: Symbol("DeleteProductUC"),
  GetProductsUC: Symbol("GetProductsUC"),
  GetProductByIdUC: Symbol("GetProductByIdUC"),
  // Course tokens
  CourseRemoteDS: Symbol("CourseRemoteDS"),
  CourseRepo: Symbol("CourseRepo"),
  CreateCourseUC: Symbol("CreateCourseUC"),
  GetAllCoursesUC: Symbol("GetAllCoursesUC"),
  GetCourseByIdUC: Symbol("GetCourseByIdUC"),
  JoinCourseUC: Symbol("JoinCourseUC"),
  // Add Product tokens if you want to DI those too...

  // Group tokens
  GroupRemoteDS: Symbol("GroupRemoteDS"),
  GroupRepo: Symbol("GroupRepo"),
  GetGroupsByCategoryUC: Symbol("GetGroupsByCategoryUC"),
  AddGroupUC: Symbol("AddGroupUC"),
  JoinGroupUC: Symbol("JoinGroupUC"),
  CreateGroupsForCategoryUC: Symbol("CreateGroupsForCategoryUC"),
  AssignStudentToGroupUC: Symbol("AssignStudentToGroupUC"),
  FindStudentGroupUC: Symbol("FindStudentGroupUC"),
  MoveStudentToGroupUC: Symbol("MoveStudentToGroupUC"),

} as const;
