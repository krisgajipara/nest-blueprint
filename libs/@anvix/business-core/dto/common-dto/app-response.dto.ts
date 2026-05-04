import { IAppResponse } from "@core-interfaces";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Standardized API response wrapper
 */
export class AppResponse<T extends object | object[]> implements IAppResponse {
    /**
     * Constructor for AppResponse
     * @param message - The response message
     * @param data - The response data
     * @param parameters - Additional parameters for message formatting
     */
    constructor(message: string, data: object | object[] | undefined | T, parameters?: { [key: string]: any }) {
        this.message = message;
        this.data = data;
        this.parameters = parameters;
    }

    @ApiProperty({
        description: "A message describing the result of the API call",
        example: "Message for api action"
    })
    message: string;

    @ApiProperty({
        description: "The data returned by the API"
    })
    data: object | object[] | undefined | T;

    parameters: { [key: string]: any };
}

/*
 ===============================================: EXAMPLE :======================================================

 return new AppResponse(SuccessConstant.AddSuccessAction, { data }, { module: "Customer" });
 return new AppResponse(SuccessConstant.UpdateSuccessAction, {}, { module: 'User' });
 return new AppResponse(SuccessConstant.RemoveSuccessAction, {}, { module: "Profile picture" });
 return new AppResponse(SuccessConstant.SuccessAction, {}, { module: 'notification', action: 'send' });
 return new AppResponse(SuccessConstant.DetailFetch, response , { module: 'Profile' });  // Need to return data so passed as second parameter
 return new AppResponse(SuccessConstant.ListFetch, response, { module: "Upcoming Appointment" });  // Pass your data to second parameter as returned object

 // One can use data parameter as per their requirement

 return new AppResponse(SuccessConstant.ListFetch, response, { module: "User" });
 return new AppResponse(SuccessConstant.ListFetch, { response }, { module: "User" });
 return new AppResponse(SuccessConstant.ListFetch, { response, userDetails }, { module: "User" });

 ===============================================: EXAMPLE :======================================================
 */
