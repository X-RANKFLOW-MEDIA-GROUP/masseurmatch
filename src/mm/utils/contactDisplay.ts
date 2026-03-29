// Função utilitária para exibir botões de contato conforme regras
export function getContactButtons({ phone, whatsapp, email, showEmailButton }: {
  phone?: string;
  whatsapp?: string;
  email?: string;
  showEmailButton?: boolean;
}) {
  const buttons = [];
  if (phone) {
    buttons.push({ type: 'call', label: 'Call', hidden: true });
    buttons.push({ type: 'text', label: 'Text', hidden: true });
    buttons.push({ type: 'reveal', label: 'Reveal Number', hidden: false });
  }
  if (whatsapp) {
    buttons.push({ type: 'whatsapp', label: 'WhatsApp', hidden: true });
  }
  if (showEmailButton && email) {
    buttons.push({ type: 'email', label: 'Email', hidden: false });
  }
  return buttons;
}
