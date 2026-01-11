import { env } from "@/lib/env/server";

/**
 * Calculates a contrasting text color (black or white) based on the background color luminance.
 * Uses the WCAG relative luminance formula for accessibility.
 * @param hexColor - The background color in hex format (e.g., "#1a1a2e")
 * @returns "#FFFFFF" for dark backgrounds, "#000000" for light backgrounds
 */
export const getContrastingTextColor = (hexColor: string): string => {
  const hex = hexColor.replace("#", "");
  
  const r = Number.parseInt(hex.substring(0, 2), 16) / 255;
  const g = Number.parseInt(hex.substring(2, 4), 16) / 255;
  const b = Number.parseInt(hex.substring(4, 6), 16) / 255;

  const toLinear = (c: number) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);

  return luminance > 0.179 ? "#000000" : "#FFFFFF";
};

export const fetchJwtToken = async () => {
  const response = await fetch(
    `https://api.placid.app/api/editor/accesstokens`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.PLACID_PRIVATE_TOKEN}`,
      },
      body: JSON.stringify({
        exp: 1778783015,
        scopes: ["templates:write"],
      }),
    }
  );

  const data = (await response.json()) as {
    access_token: string;
    expires_at: string;
  };

  return data;
};

export const fetchTemplates = async () => {
  const response = await fetch(`https://api.placid.app/api/rest/templates`, {
    headers: {
      Authorization: `Bearer ${env.PLACID_PRIVATE_TOKEN}`,
    },
  });

  const data = (await response.json()) as {
    data: {
      uuid: string;
      title: string;
      thumbnail: string;
    }[];
  };

  return data;
};

export const templateIds = {
  bookmark: "basucaav26co9",
  prayerCardFront: "rwkhdblq0lu3e",
  prayerCardBack: "0ji5jui4zn8gk",
  singlePageMemorial: "aebmcazbf4nsw",
}

export const fetchTemplate = async (uuid: string) => {
  const response = await fetch(
    `https://api.placid.app/api/rest/templates/${uuid}`,
    {
      headers: {
        Authorization: `Bearer ${env.PLACID_PRIVATE_TOKEN}`,
      },
    }
  );

  const data = (await response.json()) as {
    template: {
      uuid: string;
      title: string;
      thumbnail: string;
    };
  };

  return data;
};

export interface PlacidRequest {
  portrait: string;
  name: string;
  epitaph: string;
  birth: string;
  death: string;
  citation: string;
}

export interface PlacidImage {
  id: number;
  status: "queued" | "finished" | "error";
  image_url: string;
  polling_url: string;
}

export const generateImage = async ({
  variables,
  templateId,
}: {
  variables: PlacidRequest;
  templateId: string;
}) => {
  const response = await fetch("https://api.placid.app/api/rest/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PLACID_PRIVATE_TOKEN}`,
      "Content-Type": "application/json",
      "X-RateLimit-Limit": "3", // limit generation to 3 per minute
    },
    body: JSON.stringify({
      template_uuid: templateId,
      layers: {
        portrait: {
          image: variables.portrait,
        },
        name: {
          text: variables.name,
        },
        epitaph: {
          text: variables.epitaph,
        },
        citation: {
          text: variables.citation,
        },
        birth: {
          text: variables.birth,
        },
        death: {
          text: variables.death,
        },
      },
    }),
  });

  return (await response.json()) as PlacidImage;
};

export const fetchImage = async (id: number) => {
  const response = await fetch(`https://api.placid.app/api/rest/images/${id}`, {
    headers: {
      Authorization: `Bearer ${env.PLACID_PRIVATE_TOKEN}`,
    },
  });

  const data = (await response.json()) as PlacidImage;

  return data;
};

export interface PlacidCardRequest {
  portrait: string; // URL to the portrait image
  name: string; // Name of the deceased
  epitaph?: string; // epitaph text
  overlay?: string; // overlay color (hex code)
  text_color?: string; // text color (hex code) - calculated from overlay if not provided
  birth?: string; // birth date
  death?: string; // death date
  background_image?: string; // background image
  icon?: string; // icon image (URL or base64)
  service?: string; // service text
  prayer?: string; // prayer text
  citation?: string; // citation text
  quote?: string; // quote text
  obit_summary?: string; // obituary summary
}


export const generateBookmark = async ({
  variables,
  templateId,
}: {
  variables: PlacidCardRequest;
  templateId: string;
}) => {
  const textColor =
    variables.text_color ||
    (variables.overlay ? getContrastingTextColor(variables.overlay) : "#000000");

  const response = await fetch("https://api.placid.app/api/rest/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PLACID_PRIVATE_TOKEN}`,
      "Content-Type": "application/json",
      "X-RateLimit-Limit": "8", // limit generation to 3 per minute
    },
    body: JSON.stringify({
      template_uuid: templateId,
      layers: {
        portrait: {
          image: variables.portrait,
        },
        name: {
          text: variables.name,
          text_color: textColor,
        },
        excerpt: {
          text: variables.epitaph,
          text_color: textColor,
        },
        overlay: {
          background_color: variables.overlay,
        },
        birth: {
          text: variables.birth,
          text_color: textColor,
        },
        death: {
          text: variables.death,
          text_color: textColor,
        },
        background_image: {
          image: variables.background_image,
        },
      },
    }),
  });

  return (await response.json()) as PlacidImage;
};

export const generatePrayerCardFront = async ({
  variables,
  templateId,
}: {
  variables: PlacidCardRequest;
  templateId: string;
}) => {
  const textColor =
    variables.text_color ||
    (variables.overlay ? getContrastingTextColor(variables.overlay) : "#000000");

  const response = await fetch("https://api.placid.app/api/rest/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PLACID_PRIVATE_TOKEN}`,
      "Content-Type": "application/json",
      "X-RateLimit-Limit": "8", // limit generation to 3 per minute
    },
    body: JSON.stringify({
      template_uuid: templateId,
      layers: {
        portrait: {
          image: variables.portrait,
        },
        name: {
          text: variables.name,
          text_color: textColor,
        },
        epitaph: {
          text: variables.epitaph,
          text_color: textColor,
        },
        overlay: {
          background_color: variables.overlay,
        },
        birth: {
          text: variables.birth,
          text_color: textColor,
        },
        death: {
          text: variables.death,
          text_color: textColor,
        },
        background_image: {
          image: variables.background_image,
        },
        icon: {
          image: variables.icon,
          hide: variables.icon ? false : true,
        }
      },
    }),
  });

  return (await response.json()) as PlacidImage;
};

export const generatePrayerCardBack = async ({
  variables,
  templateId,
}: {
  variables: PlacidCardRequest;
  templateId: string;
}) => {
  const textColor =
    variables.text_color ||
    (variables.overlay ? getContrastingTextColor(variables.overlay) : "#000000");

  const response = await fetch("https://api.placid.app/api/rest/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PLACID_PRIVATE_TOKEN}`,
      "Content-Type": "application/json",
      "X-RateLimit-Limit": "8", // limit generation to 3 per minute
    },
    body: JSON.stringify({
      template_uuid: templateId,
      layers: {
        service: {
          text: variables.service,
          text_color: textColor,
        },
        overlay: {
          background_color: variables.overlay,
        },
        background_image: {
          image: variables.background_image,
        },
        prayer: {
          image: variables.icon,
        }
      },
    }),
  });

  return (await response.json()) as PlacidImage;
};

export const generateSinglePageMemorial = async ({
  variables,
  templateId,
}: {
  variables: PlacidCardRequest;
  templateId: string;
}) => {
  const textColor =
    variables.text_color ||
    (variables.overlay ? getContrastingTextColor(variables.overlay) : "#000000");

  const response = await fetch("https://api.placid.app/api/rest/images", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PLACID_PRIVATE_TOKEN}`,
      "Content-Type": "application/json",
      "X-RateLimit-Limit": "8", // limit generation to 3 per minute
    },
    body: JSON.stringify({
      template_uuid: templateId,
      layers: {
        portrait: {
          image: variables.portrait,
        },
        name: {
          text: variables.name,
          text_color: textColor,
        },
        obit_summary: {
          text: variables.obit_summary,
          text_color: textColor,
        },
        overlay: {
          background_color: variables.overlay,
        },
        birth: {
          text: variables.birth,
          text_color: textColor,
        },
        death: {
          text: variables.death,
          text_color: textColor,
        },
        background_image: {
          image: variables.background_image,
        },
        service: {
          text: variables.service,
          text_color: textColor,
        }
      },
    }),
  });

  return (await response.json()) as PlacidImage;
};