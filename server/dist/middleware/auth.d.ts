import type { Request, Response, NextFunction } from "express";
export declare const getJwtSecret: () => string;
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: "admin" | "customer";
            };
        }
    }
}
export declare const verifyToken: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireAdmin: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.d.ts.map