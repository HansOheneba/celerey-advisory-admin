import { StyleSheet } from "@react-pdf/renderer";

import { brandColors } from "@/lib/brand";

export const REPORT_PAGES = 6;

/** Fidelity palette (four swatches + black) for print. */
export const colors = {
  navy: brandColors.orange,
  navyDeep: brandColors.brown,
  accent: brandColors.orange,
  gold: brandColors.brown,
  ink: brandColors.black,
  muted: brandColors.brown,
  rule: brandColors.brown,
  panel: brandColors.cream,
  page: brandColors.cream,
  white: brandColors.white,
  positive: brandColors.brown,
  negative: brandColors.black,
};

/**
 * @react-pdf ships Helvetica and Times-Roman, so the report needs no font
 * files to render. Times for headings gives the serif/sans contrast a wealth
 * report expects.
 */
export const fonts = {
  heading: "Times-Roman",
  body: "Helvetica",
  bodyBold: "Helvetica-Bold",
};

/** `public/fidelity/fidelity-symbol.png` */
const COVER_LOGO_WIDTH = 72;
const COVER_LOGO_HEIGHT = 72;

export const reportStyles = StyleSheet.create({
  page: {
    backgroundColor: colors.page,
    paddingTop: 52,
    paddingBottom: 44,
    paddingHorizontal: 40,
    fontFamily: fonts.body,
    fontSize: 9,
    color: colors.ink,
  },
  coverPage: {
    backgroundColor: colors.navy,
    paddingTop: 0,
    paddingBottom: 44,
    paddingHorizontal: 0,
    fontFamily: fonts.body,
  },
  runningHeader: {
    position: "absolute",
    top: 18,
    left: 40,
    right: 40,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.rule,
    paddingBottom: 6,
  },
  runningHeaderText: {
    fontSize: 6.5,
    color: colors.muted,
    fontFamily: fonts.body,
    letterSpacing: 0.3,
  },
  runningFooter: {
    position: "absolute",
    bottom: 16,
    left: 40,
    right: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: colors.rule,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 6.5,
    color: colors.muted,
    fontFamily: fonts.body,
  },
  footerCenter: {
    fontSize: 6.5,
    color: colors.muted,
    fontFamily: fonts.bodyBold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  coverLogo: {
    width: COVER_LOGO_WIDTH,
    height: COVER_LOGO_HEIGHT,
    marginBottom: 20,
    objectFit: "contain",
    objectPosition: "left",
  },
  coverTitle: {
    fontFamily: fonts.heading,
    fontSize: 30,
    color: colors.white,
    marginBottom: 8,
  },
  coverSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: brandColors.brown,
    marginBottom: 4,
  },
  coverMeta: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    marginTop: 20,
  },
  coverRule: {
    width: 48,
    height: 2,
    backgroundColor: colors.accent,
    marginTop: 20,
    marginBottom: 20,
  },
  level1: {
    fontFamily: fonts.heading,
    fontSize: 22,
    color: colors.navy,
    marginBottom: 4,
  },
  level2: {
    fontFamily: fonts.heading,
    fontSize: 14,
    color: colors.navy,
    marginTop: 4,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 0.75,
    borderBottomColor: colors.accent,
  },
  level3: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.navy,
    marginTop: 12,
    marginBottom: 6,
  },
  bodyText: {
    fontFamily: fonts.body,
    fontSize: 9,
    lineHeight: 1.55,
    color: brandColors.black,
  },
  muted: {
    fontFamily: fonts.body,
    fontSize: 8,
    color: colors.muted,
    lineHeight: 1.45,
  },
  kpiBand: {
    flexDirection: "row",
    backgroundColor: colors.panel,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 12,
    marginBottom: 14,
    gap: 8,
  },
  kpiCell: {
    flex: 1,
  },
  kpiLabel: {
    fontSize: 6.5,
    fontFamily: fonts.bodyBold,
    color: colors.muted,
    letterSpacing: 0.9,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  kpiValue: {
    fontSize: 15,
    fontFamily: fonts.bodyBold,
    color: colors.navy,
  },
  detailGrid: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 6.5,
    fontFamily: fonts.bodyBold,
    color: colors.accent,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 2,
    marginTop: 6,
  },
  detailValue: {
    fontSize: 9,
    fontFamily: fonts.body,
    color: brandColors.black,
    marginBottom: 2,
  },
  table: {
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: colors.navy,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 7,
    fontFamily: fonts.bodyBold,
    color: colors.white,
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.rule,
  },
  tableRowAlt: {
    backgroundColor: colors.white,
  },
  tableCell: {
    fontSize: 8,
    fontFamily: fonts.body,
    color: brandColors.black,
  },
  tableCellRight: {
    fontSize: 8,
    fontFamily: fonts.bodyBold,
    textAlign: "right",
    color: colors.ink,
  },
  tableTotal: {
    flexDirection: "row",
    backgroundColor: colors.panel,
    borderTopWidth: 1,
    borderTopColor: colors.accent,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableTotalText: {
    fontSize: 8,
    fontFamily: fonts.bodyBold,
    color: colors.navy,
  },
  chartBox: {
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 0.5,
    borderColor: colors.rule,
    backgroundColor: colors.white,
  },
  chartCaption: {
    fontSize: 7,
    color: colors.muted,
    marginBottom: 4,
    fontFamily: fonts.body,
  },
  chartAxisLabel: {
    fontSize: 6.5,
    color: colors.muted,
    fontFamily: fonts.body,
  },
  footnote: {
    fontSize: 7,
    color: colors.muted,
    marginTop: 4,
    lineHeight: 1.4,
    fontFamily: fonts.body,
  },
  bulletRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 5,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
    marginTop: 4,
  },
  emptyRow: {
    fontSize: 8,
    color: colors.muted,
    fontFamily: fonts.body,
    paddingVertical: 6,
  },
});

/** Slice colours, cycled in allocation order. */
export const ALLOCATION_COLORS = [
  brandColors.orange,
  brandColors.brown,
  brandColors.black,
  brandColors.cream,
  brandColors.white,
];
