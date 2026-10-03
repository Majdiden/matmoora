import { gql } from 'graphql-request';

/**
 * Real WPGraphQL queries. The data layer in `../data.ts` calls these when
 * `shouldUseFixtures()` is false. Shape is designed to minimise round
 * trips — a single Investigation query returns the hub + related content.
 */

export const AllInvestigationsQuery = gql`
  query AllInvestigations($language: LanguageCodeFilterEnum = AR) {
    investigations(first: 100, where: { language: $language, orderby: { field: DATE, order: DESC } }) {
      nodes {
        slug
        title
        excerpt
        featuredImage { node { sourceUrl altText } }
        investigationFields {
          eventStart
          eventEnd
          methodologySummary
          languages
        }
        mmLocations: locations { nodes { name } }
        mmPartners: partners { nodes { name } }
      }
    }
  }
`;

export const InvestigationBySlugQuery = gql`
  query InvestigationBySlug($slug: ID!) {
    investigation(id: $slug, idType: SLUG) {
      slug
      title
      content
      excerpt
      featuredImage { node { sourceUrl altText } }
      investigationFields {
        eventStart
        eventEnd
        methodologySummary
        executiveSummary
        languages
        fullReportPdf { node { mediaItemUrl title } }
        relatedInvestigations { nodes { ... on Investigation { slug title } } }
        relatedActivities { nodes { ... on Activity { slug title activityFields { when city country externalUrl } } } }
      }
      locations { nodes { name slug } }
      partners  { nodes { name slug } }
      themes    { nodes { name slug } }
    }
  }
`;

export const ContentBySlugQuery = gql`
  query ContentBySlug($slug: ID!) {
    article(id: $slug, idType: SLUG)     { slug title content excerpt sharedFields { eventDate contributors language investigationRef { ... on Investigation { slug title } } } locations { nodes { name } } themes { nodes { name slug } } }
    story(id: $slug, idType: SLUG)       { slug title content excerpt sharedFields { eventDate contributors language investigationRef { ... on Investigation { slug title } } } locations { nodes { name } } themes { nodes { name slug } } }
    publication(id: $slug, idType: SLUG) { slug title content excerpt sharedFields { eventDate contributors language investigationRef { ... on Investigation { slug title } } } publicationFields { publicationPdf { node { mediaItemUrl } } flipbookUrl publicationKind } locations { nodes { name } } themes { nodes { name slug } } }
    video(id: $slug, idType: SLUG)       { slug title content excerpt sharedFields { eventDate contributors language investigationRef { ... on Investigation { slug title } } } videoFields { videoUrl durationSeconds producer } locations { nodes { name } } themes { nodes { name slug } } }
    audio(id: $slug, idType: SLUG)       { slug title content excerpt sharedFields { eventDate contributors language investigationRef { ... on Investigation { slug title } } } audioFields { audioUrl durationSeconds producer } locations { nodes { name } } themes { nodes { name slug } } }
  }
`;
