export type CreateCourseDto = {
    title: string;
    description: string;
    invitationCode: string;
    imageUrl?: string;
    createdByUserId: string;
    createdByUserEmail: string;
}