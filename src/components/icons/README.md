# MasseurMatch Sketch Icons

Biblioteca de ícones SVG no estilo **luxuoso masculino hand-drawn** (traço fino, sketch effect via SVG filter).

## Setup

Adicione o `<SketchFilter />` **uma vez** no root layout, antes de qualquer conteúdo:

```tsx
// app/layout.tsx
import { SketchFilter } from '@/components/icons';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SketchFilter />
        {children}
      </body>
    </html>
  );
}
```

## Uso

```tsx
import { IconShield, IconStar, IconHand } from '@/components/icons';

// Tamanho padrão (24px), sketch sutil
<IconShield />

// Tamanho personalizado
<IconStar size={32} />

// Sem sketch (linha limpa)
<IconHand sketch="none" />

// Sketch mais forte (para decoração)
<IconSpark sketch="strong" />

// Com Tailwind
<IconShield className="text-[#8B1E2D] hover:text-[#6E1521]" size={20} />
```

## Controle de cor

Todos os ícones usam `currentColor`. Controle via CSS:

```css
/* Default */
.icon { color: #1F1F1F; }

/* Accent vermelho no hover */
.icon:hover { color: #8B1E2D; }

/* Muted / secondary */
.icon-muted { color: #6F6F6F; }
```

Ou com Tailwind:
```tsx
<IconShield className="text-[#1F1F1F] group-hover:text-[#8B1E2D] transition-colors" />
```

## Ícones disponíveis

| Ícone            | Uso recomendado                        |
|------------------|----------------------------------------|
| `IconShield`     | Confiança / verificado / segurança     |
| `IconStar`       | Rating / premium / destaque            |
| `IconHand`       | Massagem / serviço principal           |
| `IconSpark`      | Luxo / exclusividade / premium         |
| `IconMapPin`     | Localização / cidade / busca local     |
| `IconCalendar`   | Booking / disponibilidade              |
| `IconUser`       | Perfil / terapeuta / conta             |
| `IconAward`      | Certificação / conquista               |
| `IconMessage`    | Chat / avaliação / contato             |
| `IconCreditCard` | Pagamento / checkout                   |
| `IconSearch`     | Busca / filtro                         |
| `IconLeaf`       | Bem-estar / natural / relaxamento      |
| `IconLock`       | Privacidade / segurança de dados       |
| `IconArrowRight` | Navegação / CTA / próximo              |
| `IconHeart`      | Favorito / salvar / bem-estar          |
| `IconSliders`    | Filtros / preferências                 |
| `IconClock`      | Disponibilidade / duração              |
| `IconGlobe`      | Website / idioma                       |

## Sketch levels

| Valor     | Intensidade | Uso                                      |
|-----------|-------------|------------------------------------------|
| `subtle`  | Muito leve  | Uso padrão em toda a interface           |
| `medium`  | Médio       | Ícones grandes / hero sections           |
| `strong`  | Marcado     | Elementos decorativos / accent visual    |
| `none`    | Nenhum      | Linha limpa, sem distorção               |

## Paleta

```css
--text-strong: #1F1F1F;   /* cor padrão dos ícones */
--accent:      #8B1E2D;   /* vermelho sóbrio — hover / active */
--text-muted:  #8E8E8E;   /* ícones secundários */
```
