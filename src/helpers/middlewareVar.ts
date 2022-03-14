import { Request } from "express"

const middlewareVar = (req: Request, object: object, key: string) => {
    const middlewareObject = req.body.middleware
    if (!middlewareObject) {
        Object.assign(req.body, { middleware: { [key]: object } })
    } else {
        req.body.middleware = { ...middlewareObject, [key]: object }
    }
}

export default middlewareVar

