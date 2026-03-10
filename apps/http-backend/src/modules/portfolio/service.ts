import prismaClient from "@repo/database/client";

export const getPortfolioById = async (id: string) => {
    try {
        // const portfolio = await prismaClient.portfolio.findUnique({
        //     where: {
        //         id,
        //     },
        // });
        return{
            id: "123",
        }
    } catch (error) {
        console.log("error while getting portfolio by id", error);
        throw error;
    }
}