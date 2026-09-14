import {
  NextRequest,
  NextResponse,
} from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 86400;

type GovernmentCity = {
  city_code?: number | string;
  city_name_he?: string;
  region_code?: number | string;
  region_name?: string;
};

export async function GET(
  request: NextRequest
) {
  try {
    const query =
      request.nextUrl.searchParams
        .get("q")
        ?.trim() || "";

    const returnAll =
      request.nextUrl.searchParams.get(
        "all"
      ) === "1";

    const url =
      "https://data.gov.il/api/3/action/datastore_search" +
      "?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e" +
      "&limit=5000";

    const response = await fetch(url, {
      next: {
        revalidate: 86400,
      },
    });

    if (!response.ok) {
      throw new Error(
        "Failed to load cities"
      );
    }

    const data = await response.json();

    const records: GovernmentCity[] =
      data?.result?.records || [];

    let cities = records
      .map((city) => ({
        code: Number(city.city_code),

        name:
          city.city_name_he?.trim() ||
          "",

        regionCode:
          city.region_code ===
            undefined ||
          city.region_code === null ||
          city.region_code === ""
            ? null
            : Number(
                city.region_code
              ),

        regionName:
          city.region_name?.trim() ||
          null,
      }))
      .filter(
        (city) =>
          city.name &&
          Number.isFinite(city.code)
      );

    if (query) {
      const normalizedQuery =
        query.toLocaleLowerCase("he");

      cities = cities.filter(
        (city) =>
          city.name
            .toLocaleLowerCase("he")
            .includes(
              normalizedQuery
            )
      );
    }

    cities.sort((a, b) =>
      a.name.localeCompare(
        b.name,
        "he"
      )
    );

    return NextResponse.json({
      cities: returnAll
        ? cities
        : cities.slice(0, 20),
    });
  } catch (error) {
    console.error(
      "Cities API error:",
      error
    );

    return NextResponse.json(
      {
        cities: [],
        error:
          "לא הצלחנו לטעון את רשימת היישובים",
      },
      {
        status: 500,
      }
    );
  }
}