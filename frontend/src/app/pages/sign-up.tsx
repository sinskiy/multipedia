import atomics from "../../atomics.module.css";
import { FormEvent, useState } from "react";
import { Redirect } from "wouter";
import { useCurrentUser } from "../../lib/context-as-hooks";
import Form from "../../ui/form";
import InputField from "../../ui/input-field";
import Hr from "../../ui/hr";
import OAuth from "../../components/oauth/oauth";
import { User } from "../../types/user";
import { signUpAction } from "../../api/sign-up-action";
import { StrapiError } from "../../types/fetch";

export default function SignUp() {
  const [result, setResult] = useState<null | { user: User } | StrapiError>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { updateCurrentUser } = useCurrentUser();

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(await signUpAction(e));
  }

  if (result && loading) {
    setLoading(false);
  }

  if (result && "user" in result) {
    updateCurrentUser();
    return <Redirect to={`/users/${result.user.username}`} />;
  }

  const zodErrors = result && "zodErrors" in result && result.zodErrors;
  return (
    <section className={atomics["centered-section"]}>
      <h1 className={atomics["form-title"]}>sign up</h1>
      <Form
        onSubmit={handleSignUp}
        error={result && "error" in result && result?.error}
        loading={loading}
      >
        <InputField
          id="username"
          autoComplete="username"
          error={zodErrors && zodErrors.username}
        />
        <InputField
          id="email"
          type="email"
          autoComplete="email"
          error={zodErrors && zodErrors.email}
        />
        <InputField
          id="password"
          type="password"
          autoComplete="new-password"
          error={zodErrors && zodErrors.password}
        />
      </Form>
      <Hr label="Or continue with" />
      <OAuth />
    </section>
  );
}
