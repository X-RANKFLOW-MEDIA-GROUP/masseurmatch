import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/privacy",
      permanent: false,
    },
  };
};

export default function LegacyPrivacyRedirectPage() {
  return null;
}
