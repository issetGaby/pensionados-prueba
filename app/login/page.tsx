import LoginForm from "@/components/auth/login-form";
import Title from "@/components/UI/Title";
//import logoPositiva from "@/public/logo-positiva.svg"
import Image from "next/image";
import { isAuthenticated } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function LoginPage() {
    if (isAuthenticated()) {
    redirect('/dashboard');
  }

  return (
    <div
      className="bacgroundFondo py-[50px] md:pt-[50px] md:pb-[100px] flex
    justify-center items-center px-[16px] sm:px-0"
    >
      <div className="gap-[30px] rounded-[30px] p-5 md:p-10 md:min-w-[644px] bg-white flex justify-center flex-col items-center ">
        <Image src="/logo-positiva.svg" width={120} height={100} alt="logo de positiva" />
        <Title titulo="Bienvenido al" destacado="Portal Pensionados" /> 
       
        <p className="text-center font-normal text-base md:text-lg text-[var(--GrisTextoPlanes)] fontRoboto">
          Ingresa tu usuario y contraseña para continuar.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
