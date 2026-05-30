import { Eye, EyeOff } from "lucide-react";
import { Form, Field, Formik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const schema = Yup.object({
  email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập Email"),
  password: Yup.string().required("Vui lòng nhập mật khẩu"),
});

const LoginPage = () => {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-100">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#E32A15] via-[#f5472e] to-[#E32A15]" />

        <div className="p-8 sm:p-10">
          {/* Logo + heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E32A15] shadow-lg">
              <span className="text-lg font-black text-white">SS</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#111]">Đăng nhập tài khoản</h1>
            <p className="mt-1.5 text-sm text-slate-500">Chào mừng quay lại Shoe Store!</p>
          </div>

          <Formik initialValues={{ email: "", password: "" }} validationSchema={schema} onSubmit={login}>
            {({ errors, touched }) => (
              <Form className="space-y-5">
                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Email
                  </label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#111] outline-none transition placeholder:text-slate-400 focus:border-[#E32A15] focus:bg-white focus:ring-2 focus:ring-[#E32A15]/15"
                  />
                  {errors.email && touched.email && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-[#111] outline-none transition placeholder:text-slate-400 focus:border-[#E32A15] focus:bg-white focus:ring-2 focus:ring-[#E32A15]/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#E32A15] py-3.5 text-sm font-bold text-white shadow-lg shadow-[#E32A15]/30 transition hover:bg-[#b31f0e] hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-white/30" />
                      Đang đăng nhập...
                    </span>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-6 text-center text-sm text-slate-500">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="font-bold text-[#E32A15] hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
