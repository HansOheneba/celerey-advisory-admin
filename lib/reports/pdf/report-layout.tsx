import path from "node:path";

import { Image, Page, Path, Svg, Text, View } from "@react-pdf/renderer";

import {
  FIRM_CONTACT_LINE,
  FIRM_NAME,
} from "@/lib/reports/firm";
import { colors, fonts, reportStyles } from "@/lib/reports/pdf/report-theme";
import type { InvestmentReportData } from "@/lib/reports/types";
import { headingTitle } from "@/lib/format";

export const REPORT_LOGO = path.join(
  process.cwd(),
  "public/fidelity/fidelity-symbol.png",
);

/** White roundel mark for the orange cover (orange PNG symbol disappears on cover). */
export function CoverFidelitySymbol({
  width = 72,
  height = 72,
}: {
  width?: number;
  height?: number;
}) {
  return (
    <Svg width={width} height={height} viewBox="96 0 35 35">
      <Path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M96.8594 17.6577C96.8594 8.46876 104.332 1.02734 113.561 1.02734C122.787 1.02734 130.265 8.46876 130.265 17.6577C130.265 26.8433 122.787 34.2897 113.561 34.2897C104.332 34.2897 96.8594 26.8433 96.8594 17.6577Z"
      />
      <Path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M122.405 13.7474H104.715C104.715 10.5076 107.356 7.87891 110.611 7.87891H122.405V13.7474Z"
      />
      <Path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M104.718 21.5723H110.612H116.51C116.51 24.817 113.869 27.444 110.612 27.444H104.718V21.5723Z"
      />
      <Path
        fill="#FFFFFF"
        fillRule="evenodd"
        d="M104.719 20.5928H122.405V14.7227H104.719V20.5928Z"
      />
    </Svg>
  );
}

export function RunningHeader({ clientName }: { clientName: string }) {
  return (
    <View style={reportStyles.runningHeader} fixed>
      <Text style={reportStyles.runningHeaderText}>
        {FIRM_NAME} | Client Report | {clientName} | Confidential
      </Text>
    </View>
  );
}

export function RunningFooter({
  clientNumber,
  pageNumber,
  totalPages,
}: {
  clientNumber: string;
  pageNumber: number;
  totalPages: number;
}) {
  return (
    <View style={reportStyles.runningFooter} fixed>
      <Text style={reportStyles.footerText}>
        {FIRM_NAME}
        {"\n"}
        {FIRM_CONTACT_LINE}
      </Text>
      <Text style={reportStyles.footerCenter}>Confidential</Text>
      <Text style={reportStyles.footerText}>
        {clientNumber} · Page {pageNumber} of {totalPages}
      </Text>
    </View>
  );
}

export function ReportPageShell({
  clientName,
  clientNumber,
  pageNumber,
  totalPages,
  children,
}: {
  clientName: string;
  clientNumber: string;
  pageNumber: number;
  totalPages: number;
  children: React.ReactNode;
}) {
  return (
    <Page size="A4" style={reportStyles.page}>
      <RunningHeader clientName={clientName} />
      <View>{children}</View>
      <RunningFooter
        clientNumber={clientNumber}
        pageNumber={pageNumber}
        totalPages={totalPages}
      />
    </Page>
  );
}

export function CoverPage({
  data,
  logoSrc,
}: {
  data: InvestmentReportData;
  /** Optional override; default is white vector mark for orange cover. */
  logoSrc?: string;
}) {
  const coverMuted = {
    fontSize: 6.5,
    color: "rgba(255,255,255,0.5)",
    fontFamily: fonts.body,
  } as const;

  return (
    <Page size="A4" style={reportStyles.coverPage}>
      <View style={{ paddingTop: 36, paddingHorizontal: 40 }}>
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: 10,
            color: colors.accent,
            letterSpacing: 1.4,
            textTransform: "uppercase",
          }}
        >
          Advice with clarity
        </Text>
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "flex-start",
          paddingTop: 48,
          paddingHorizontal: 40,
        }}
      >
        {logoSrc ? (
          <Image src={logoSrc} style={reportStyles.coverLogo} />
        ) : (
          <View style={reportStyles.coverLogo}>
            <CoverFidelitySymbol />
          </View>
        )}
        <View style={reportStyles.coverRule} />
        <Text style={reportStyles.coverTitle}>{data.reportKindTitle}</Text>
        <Text style={reportStyles.coverSubtitle}>{data.clientName}</Text>
        <Text style={reportStyles.coverSubtitle}>
          {data.statementPeriodLabel}
        </Text>
        <Text style={reportStyles.coverMeta}>
          Prepared on {data.preparedOn}
        </Text>
        <Text style={reportStyles.coverMeta}>Reference {data.reference}</Text>
      </View>

      <View style={reportStyles.runningFooter}>
        <Text style={coverMuted}>{FIRM_NAME}</Text>
        <Text style={coverMuted}>Confidential</Text>
        <Text style={coverMuted}>
          {data.clientNumber} · Page 1 of {data.totalPages}
        </Text>
      </View>
    </Page>
  );
}

export function SubsectionTitle({ children }: { children: string }) {
  return <Text style={reportStyles.level3}>{headingTitle(children)}</Text>;
}

export function KpiBand({
  items,
}: {
  items: Array<{ label: string; value: string }>;
}) {
  return (
    <View style={reportStyles.kpiBand}>
      {items.map((item) => (
        <View key={item.label} style={reportStyles.kpiCell}>
          <Text style={reportStyles.kpiLabel}>{headingTitle(item.label)}</Text>
          <Text style={reportStyles.kpiValue}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((item) => (
        <View key={item} style={reportStyles.bulletRow}>
          <View style={reportStyles.bulletDot} />
          <Text style={reportStyles.bodyText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
