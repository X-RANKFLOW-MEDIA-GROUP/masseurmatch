"use client";

export function DebugProfilesButton() {
  const handleClick = async () => {
    try {
      const response = await fetch("/api/pro/profiles?city=S%C3%A3o%20Paulo&technique=Deep%20Tissue");
      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = (await response.json()) as { profiles?: unknown[] };
      const profiles = data.profiles ?? [];
      alert(`Perfis encontrados: ${profiles.length}`);
      console.log(profiles);
    } catch {
      alert("Erro ao buscar perfis");
    }
  };

  return (
    <button className="btn btn-secondary mt-4" onClick={handleClick} type="button">
      Debug: Buscar perfis (Sao Paulo, Deep Tissue)
    </button>
  );
}
