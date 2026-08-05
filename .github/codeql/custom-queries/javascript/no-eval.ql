/**
 * @name Use of eval()
 * @description Flags any call to eval(), which executes arbitrary
 *              strings as code. In an RBAC-related codebase this is
 *              worth catching explicitly: dynamic code execution is
 *              exactly the kind of pattern that can bypass permission
 *              checks written elsewhere in the app.
 * @kind problem
 * @problem.severity warning
 * @security-severity 7.0
 * @precision high
 * @id js/least-privilege-demo/no-eval
 * @tags security
 *       external/cwe/cwe-95
 */

import javascript

from CallExpr call
where call.getCalleeName() = "eval"
select call, "Avoid eval() — dynamic code execution bypasses static review and can undermine access control logic elsewhere in the app."
