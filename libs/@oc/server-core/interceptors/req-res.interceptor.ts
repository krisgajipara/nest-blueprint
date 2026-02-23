import { TranslationFile } from "@core-enums";
import { Translation } from "@core-utilities";
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable()
export class ReqResInterceptor implements NestInterceptor {
    public intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map(async (res) => {
                const request = _context.switchToHttp().getRequest();
                const lang =
                    request?.body?.language_code ||
                    request?.query?.language_code ||
                    request?.params?.language_code ||
                    request?.user?.language_code ||
                    request?.headers?.language_code;
                if (res.message) {
                    res.message = await Translation.Translator(
                        lang || "en",
                        TranslationFile.Success,
                        res.message,
                        res.parameters
                    );
                }
                if (res.parameters) delete res.parameters;
                return res;
            })
        );
    }
}
