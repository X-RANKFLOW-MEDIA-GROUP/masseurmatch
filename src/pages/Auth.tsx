import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/auth",
      permanent: false,
    },
  };
};

export default function LegacyAuthRedirectPage() {
  return null;
}
