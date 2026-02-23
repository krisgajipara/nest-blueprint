Please go through these all task to get understangin of whole nestJS Project:

1. "Please check prject and project architecture"
2. "Read all .md files for validation rules and architecture"
3. "go through - libs/@/libs/@oc/server-core/utilities/translation.utility.ts"
4. "go through - libs/@/libs/@oc/server-core/filters/all-exceptions.filter.ts"
5. "Go through all DTos in "libs/@oc/business-core/dto/common-dto/*" one by one and get understangin how they are getting use in code"
6. "Check how app response and success message are getting build from below syntext:
    return new AppResponse(SuccessConstant.RemoveSuccessAction, {}, { module: "Profile picture" });"
7. "Please go through custom-validators"
8. "Please go through all files from  "libs/@oc/server-core/database/*""
9. "Please go through all files from "libs/@oc/server-core/custom-decorators/*" and grab the use of it"
10. "Please go through all files from "libs/@oc/server-core/custom-guards/*" and grab the use of it"
11. "Please go through all files from "libs/@oc/business-core/modules/*" and grab businness requirement from it"
12. please go through the multi-tenancy setup like tenant-aware repository, typeORM subscribers