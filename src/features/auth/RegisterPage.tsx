import { useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";
import { registerSchema, type RegisterFormValues } from "./schemas";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InputField } from "@/components/shared/InputField";
import { Loader2 } from "lucide-react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function RegisterPage() {
  useDocumentTitle("Register");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = useCallback(
    async (data: RegisterFormValues) => {
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) {
        toast.error(signUpError.message);
        return;
      }

      // Usually, we could update user meta data here or let the postgres trigger handle profile insertion
      // The postgres trigger we created (`handle_new_user`) will auto-insert into `public.users`
      // We can also update the profile row right after if we want to store firstName and lastName
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase
          .from("users")
          .update({
            first_name: data.firstName,
            last_name: data.lastName,
          })
          .eq("id", userData.user.id);
      }

      toast.success("Account created successfully!");
      navigate("/dashboard", { replace: true });
    },
    [navigate],
  );

  return (
    <div className="flex h-screen w-full items-center justify-center p-4 py-10 overflow-y-auto">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="First Name"
                placeholder="John"
                {...register("firstName")}
                error={errors.firstName?.message}
              />
              <InputField
                label="Last Name"
                placeholder="Doe"
                {...register("lastName")}
                error={errors.lastName?.message}
              />
            </div>
            <InputField
              label="Email"
              type="email"
              placeholder="m@example.com"
              {...register("email")}
              error={errors.email?.message}
            />
            <InputField
              label="Password"
              type="password"
              {...register("password")}
              error={errors.password?.message}
            />
            <InputField
              label="Confirm Password"
              type="password"
              {...register("confirmPassword")}
              error={errors.confirmPassword?.message}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Account
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
