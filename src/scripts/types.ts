export type PatheApiShow = {
    slug: string;
    title: string;
    releaseAt: Record<string, string>;
    posterPath: {
        lg: string;
        md: string;
    };
    backgroundPath: {
        lg: string;
        md: string;
        sm: string;
    };
    label: string | null;
    contentRating: {
        ref: string;
        description: string;
        extendedDescription: string;
    };
    cinechecks: {
        ref: string;
        description: string;
    }[];
    isMovie: boolean;
    isNew: boolean;
    isEventSpecial: boolean;
    isComingSoon: boolean;
    homeOrder: number;
    genericOrder: number;
    hubbleCasting: string;
    type: string;
    upcomingOrder: number;
    mostAwaitedOrder: number;
    duration: number;
    genres: string[];
    warning: string | null;
    directors: string[];
    flag: string | null;
    flagColor: string | null;
    next24ShowtimesCount: number;
    notComingSoon: boolean;
    salesOpeningDatetime: string | null;
    showtimesDisplayDatetime: string | null;
    backgroundDominantColor: string;
    labelFlagColor: string | null;
    originalReleaseAt: string | null;
    showRef: string;
    specialEvent: boolean;
}

export type PatheApiTheatreShow = {
    days: Record<
        string,
        {
            tags: string[];
            bookable: boolean;
            versions?: string[];
            flag: string | null;
            flagColor: string | null;
            cineOrder: number;
            specialEvent: any | null;
            specialShowtime: boolean;
        }
    >;
    bookable: boolean;
    isBookable: boolean;
    isNew: boolean;
    isComingSoon: boolean;
    isEarlyVisible: boolean;
    isEarlyBookable: boolean;
    isEarlyAVP: boolean;
    cineOrder: number;
    cineSpecialOrder: number | null;
    cineKidsOrder: number | null;
    cineUpcomingOrder: number;
    cineEntertainmentOrder: number;
    cineEntertainmentOrder2: number;
    specialEvent: boolean;
    isKids: boolean;
    next24ShowtimesCount: number;
    // some entries may include other fields; index signature can be used if needed:
    [extra: string]: any;
};


export type PatheApiTheatreShows = {
    days: Record<
        string,
        {
            upsell: { tag: string; showSlug: string } | null;
            highlightedShowtime: null | { type: string; showSlug: string };
        }
    >;
    shows: Record<
        string,
        PatheApiTheatreShow
    >;
};

export type PatheApiShowDetails = {
    slug: string;
    title: string;
    titleTracking: string;
    releaseAt: Record<string, string>;
    contentRating: {
        ref: string;
        description: string;
        extendedDescription: string;
    };
    cinechecks: {
        ref: string;
        description: string;
    }[];
    genres: string[];
    genresTracking: string[];
    duration: number;
    directors: string;
    actors: string;
    synopsis: string;
    entertainementLogo: string | null;
    entertainementSubtitle: string | null;
    distribution: string | null;
    entertainementCasting: string;
    posterPath: {
        lg: string;
        md: string;
    };
    backgroundPath: {
        lg: string;
        md: string;
        sm: string;
    };
    backgroundDominantColor: string;
    isMovie: boolean;
    trailers: {
        externalId: string;
        videoType: string;
        title: string;
        snapshot: string;
        isMain: boolean;
        language: string;
    }[];
    presentation: string | null;
    calendar: string | null;
    warning: string | null;
    nationality: string | null;
    nationalityTracking: string | null;
    originalTitle: string;
    feelings: {
        countWishList: number;
        countEmotionDisappointed: number;
        countEmotionLike: number;
        countEmotionLove: number;
    };
    similarShows: any[];
    event: any[];
    redirectSlug: string | null;
    refHubble: string;
    isNew: boolean;
    notComingSoon: boolean;
    visaHubble: string | null;
    copiesCount: number;
    next24ShowtimesCount: number;
    tags: string[];
    salesOpeningDatetime: string | null;
    showtimesDisplayDatetime: string | null;
    vodAvailability: boolean;
    vod: any | null;
    refVista: string;
    labelFlagColor: string | null;
    label: string | null;
    originalReleaseAt: string | null;
    extraInformation: string | null;
    logoTitle: string | null;
}

export type PatheApiShowtime = {
    status: string;
    time: string;
    version: string;
    tags: string[];
    reservabilityStart: string;
    reservabilityEnd: string;
    isMovie: boolean;
    refCmd: string;
    auditoriumName: string;
    auditoriumCapacity: string;
    endTime: string;
    specialShowtimeDetails: any | null;
}

export type CombinedPatheShow = PatheApiShow & { details: PatheApiShowDetails, theatreShow: PatheApiTheatreShow | null, showtimes: PatheApiShowtime[] };