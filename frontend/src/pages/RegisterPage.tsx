import { Form, Field, Formik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-]).{8,64}$/;

const schema = Yup.object({
  fullName: Yup.string().required("Vui lòng nhập họ và tên"),
  email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
  phoneNumber: Yup.string().required("Vui lòng nhập số điện thoại"),
  password: Yup.string()
    .matches(passwordRegex, "Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt")
    .required("Vui lòng nhập mật khẩu"),
});

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-[#111] outline-none transition placeholder:text-slate-400 focus:border-[#E32A15] focus:bg-white focus:ring-2 focus:ring-[#E32A15]/15";

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-lg">
      {/* Card */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-100">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-[#E32A15] via-[#f5472e] to-[#E32A15]" />

        <div className="p-8 sm:p-10">
          {/* Heading */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E32A15] shadow-lg">
              <span className="text-lg font-black text-white">SS</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#111]">Tạo tài khoản mới</h1>
            <p className="mt-1.5 text-sm text-slate-500">Tham gia Shoe Store để mua sắm dễ dàng hơn!</p>
          </div>

          <Formik
            initialValues={{ fullName: "", email: "", phoneNumber: "", password: "" }}
            validationSchema={schema}
            onSubmit={register}
          >
            {({ errors, touched }) => (
              <Form className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Họ và tên</label>
                  <Field name="fullName" placeholder="Nguyễn Văn A" className={inputClass} />
                  {errors.fullName && touched.fullName && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Email</label>
                  <Field name="email" type="email" placeholder="you@example.com" className={inputClass} />
                  {errors.email && touched.email && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Số điện thoại</label>
                  <Field name="phoneNumber" placeholder="0868 099 315" className={inputClass} />
                  {errors.phoneNumber && touched.phoneNumber && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.phoneNumber}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Mật khẩu</label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`${inputClass} pr-12`}
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
                  <p className="mt-1.5 text-[11px] text-slate-400">Tối thiểu 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt.</p>
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
                      Đang tạo tài khoản...
                    </span>
                  ) : (
                    "Đăng ký ngay"
                  )}
                </button>
              </Form>
            )}
          </Formik>

          <p className="mt-6 text-center text-sm text-slate-500">
            Đã có tài khoản?{" "}
            <Link to="/login" className="font-bold text-[#E32A15] hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
