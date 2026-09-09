import { Document, Text, View } from "@react-pdf/renderer";

import {
  FIRM_ADDRESS,
  FIRM_CONTACT_LINE,
  FIRM_LEGAL_LINE,
  FIRM_NAME,
} from "@/lib/reports/firm";
import { formatLongDate, formatPct, formatUsd } from "@/lib/reports/format";
import {
  AllocationChart,
  ValueChart,
} from "@/lib/reports/pdf/report-charts";
import {
  BulletList,
  CoverPage,
  KpiBand,
  REPORT_LOGO,
  ReportPageShell,
  SubsectionTitle,
} from "@/lib/reports/pdf/report-layout";
import { reportStyles } from "@/lib/reports/pdf/report-theme";
import type {
  InvestmentReportData,
  ReportTransactionRow,
} from "@/lib/reports/types";

function ClientDetailsGrid({ data }: { data: InvestmentReportData }) {
  return (
    <View style={reportStyles.detailGrid}>
      <View style={reportStyles.detailCol}>
        <Text style={reportStyles.detailLabel}>Prepared for</Text>
        <Text style={reportStyles.detailValue}>{data.clientName}</Text>
        <Text style={reportStyles.detailValue}>{data.address.line1}</Text>
        <Text style={reportStyles.detailValue}>{data.address.city}</Text>
        <Text style={reportStyles.detailValue}>{data.address.country}</Text>
      </View>

      <View style={reportStyles.detailCol}>
        <Text style={reportStyles.detailLabel}>Statement</Text>
        <Text style={reportStyles.detailValue}>{data.reportKindTitle}</Text>
        <Text style={reportStyles.detailValue}>
          {data.statementPeriodLabel}
        </Text>
        <Text style={reportStyles.detailLabel}>Reference</Text>
        <Text style={reportStyles.detailValue}>{data.reference}</Text>
        <Text style={reportStyles.detailLabel}>Client number</Text>
        <Text style={reportStyles.detailValue}>{data.clientNumber}</Text>
      </View>

      <View style={reportStyles.detailCol}>
        <Text style={reportStyles.detailLabel}>Currency</Text>
        <Text style={reportStyles.detailValue}>{data.currency}</Text>
        <Text style={reportStyles.detailLabel}>Risk mandate</Text>
        <Text style={reportStyles.detailValue}>{data.riskMandate}</Text>
        {data.advisor ? (
          <>
            <Text style={reportStyles.detailLabel}>Relationship manager</Text>
            <Text style={reportStyles.detailValue}>
              {data.advisor.fullName}
            </Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

function OverviewTable({ data }: { data: InvestmentReportData }) {
  const totalPrevious = data.overviewRows.reduce(
    (total, row) => total + row.previousValueUsd,
    0,
  );
  const totalCurrent = data.overviewRows.reduce(
    (total, row) => total + row.currentValueUsd,
    0,
  );
  const totalChange = data.overviewRows
    .filter((row) => !row.isCash)
    .reduce((total, row) => total + row.periodChangeUsd, 0);

  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderText, { width: "24%" }]}>
          Asset class
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "19%", textAlign: "right" },
          ]}
        >
          Previous{"\n"}({data.previousStatementLabel})
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "19%", textAlign: "right" },
          ]}
        >
          Current{"\n"}({data.currentStatementLabel})
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "19%", textAlign: "right" },
          ]}
        >
          Change during period
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "19%", textAlign: "right" },
          ]}
        >
          % change{"\n"}in period
        </Text>
      </View>

      {data.overviewRows.map((row, index) => (
        <View
          key={row.key}
          style={[
            reportStyles.tableRow,
            index % 2 === 1 ? reportStyles.tableRowAlt : {},
          ]}
        >
          <Text style={[reportStyles.tableCell, { width: "24%" }]}>
            {row.label}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "19%" }]}>
            {formatUsd(row.previousValueUsd)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "19%" }]}>
            {formatUsd(row.currentValueUsd)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "19%" }]}>
            {row.isCash ? "N/A" : formatUsd(row.periodChangeUsd, true)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "19%" }]}>
            {row.isCash || row.ytdPct == null
              ? "N/A"
              : formatPct(row.ytdPct, true)}
          </Text>
        </View>
      ))}

      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalText, { width: "24%" }]}>
          Total
        </Text>
        <Text
          style={[
            reportStyles.tableTotalText,
            { width: "19%", textAlign: "right" },
          ]}
        >
          {formatUsd(totalPrevious)}
        </Text>
        <Text
          style={[
            reportStyles.tableTotalText,
            { width: "19%", textAlign: "right" },
          ]}
        >
          {formatUsd(totalCurrent)}
        </Text>
        <Text
          style={[
            reportStyles.tableTotalText,
            { width: "19%", textAlign: "right" },
          ]}
        >
          {formatUsd(totalChange, true)}
        </Text>
        <Text
          style={[
            reportStyles.tableTotalText,
            { width: "19%", textAlign: "right" },
          ]}
        >
          {formatPct(data.periodReturnPct, true)}
        </Text>
      </View>
    </View>
  );
}

function PeriodPerformanceTable({ data }: { data: InvestmentReportData }) {
  const invested = data.overviewRows.filter((row) => !row.isCash);

  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderText, { width: "40%" }]}>
          Asset class
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "30%", textAlign: "right" },
          ]}
        >
          Period change
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "30%", textAlign: "right" },
          ]}
        >
          % change in period
        </Text>
      </View>

      {invested.map((row, index) => (
        <View
          key={row.key}
          style={[
            reportStyles.tableRow,
            index % 2 === 1 ? reportStyles.tableRowAlt : {},
          ]}
        >
          <Text style={[reportStyles.tableCell, { width: "40%" }]}>
            {row.label}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "30%" }]}>
            {formatUsd(row.periodChangeUsd, true)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "30%" }]}>
            {row.ytdPct == null ? "N/A" : formatPct(row.ytdPct, true)}
          </Text>
        </View>
      ))}

      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalText, { width: "40%" }]}>
          Portfolio total
        </Text>
        <Text
          style={[
            reportStyles.tableTotalText,
            { width: "30%", textAlign: "right" },
          ]}
        >
          {formatUsd(data.periodGainUsd, true)}
        </Text>
        <Text
          style={[
            reportStyles.tableTotalText,
            { width: "30%", textAlign: "right" },
          ]}
        >
          {formatPct(data.periodReturnPct, true)}
        </Text>
      </View>
    </View>
  );
}

function InceptionPerformanceTable({ data }: { data: InvestmentReportData }) {
  const totalGain = data.performanceRows.reduce(
    (total, row) => total + (row.inceptionGainUsd ?? 0),
    0,
  );

  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderText, { width: "28%" }]}>
          Asset class
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "24%", textAlign: "right" },
          ]}
        >
          Gain since inception
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "24%", textAlign: "right" },
          ]}
        >
          % since inception
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "24%", textAlign: "right" },
          ]}
        >
          % annualised
        </Text>
      </View>

      {data.performanceRows.map((row, index) => (
        <View
          key={row.key}
          style={[
            reportStyles.tableRow,
            index % 2 === 1 ? reportStyles.tableRowAlt : {},
          ]}
        >
          <Text style={[reportStyles.tableCell, { width: "28%" }]}>
            {row.label}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "24%" }]}>
            {row.inceptionGainUsd == null
              ? "N/A"
              : formatUsd(row.inceptionGainUsd, true)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "24%" }]}>
            {row.inceptionPct == null ? "N/A" : formatPct(row.inceptionPct, true)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "24%" }]}>
            {row.annualisedReturnPct == null
              ? "N/A"
              : formatPct(row.annualisedReturnPct, true)}
          </Text>
        </View>
      ))}

      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalText, { width: "28%" }]}>
          Total
        </Text>
        <Text
          style={[
            reportStyles.tableTotalText,
            { width: "24%", textAlign: "right" },
          ]}
        >
          {formatUsd(totalGain, true)}
        </Text>
        <Text
          style={[
            reportStyles.tableTotalText,
            { width: "24%", textAlign: "right" },
          ]}
        />
        <Text
          style={[
            reportStyles.tableTotalText,
            { width: "24%", textAlign: "right" },
          ]}
        />
      </View>
    </View>
  );
}

function AllocationBreakdownTable({ data }: { data: InvestmentReportData }) {
  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderText, { width: "40%" }]}>
          Asset class
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "30%", textAlign: "right" },
          ]}
        >
          Value
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "30%", textAlign: "right" },
          ]}
        >
          Allocation
        </Text>
      </View>

      {data.allocationSlices.map((slice, index) => (
        <View
          key={slice.key}
          style={[
            reportStyles.tableRow,
            index % 2 === 1 ? reportStyles.tableRowAlt : {},
          ]}
        >
          <Text style={[reportStyles.tableCell, { width: "40%" }]}>
            {slice.label}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "30%" }]}>
            {formatUsd(slice.valueUsd)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "30%" }]}>
            {slice.allocationPct.toFixed(1)}%
          </Text>
        </View>
      ))}

      <View style={reportStyles.tableTotal}>
        <Text style={[reportStyles.tableTotalText, { width: "40%" }]}>
          Total portfolio
        </Text>
        <Text
          style={[
            reportStyles.tableTotalText,
            { width: "30%", textAlign: "right" },
          ]}
        >
          {formatUsd(data.totalPortfolioValueUsd)}
        </Text>
        <Text
          style={[
            reportStyles.tableTotalText,
            { width: "30%", textAlign: "right" },
          ]}
        >
          100.0%
        </Text>
      </View>
    </View>
  );
}

function GoalsTable({ data }: { data: InvestmentReportData }) {
  if (data.goals.length === 0) {
    return (
      <Text style={reportStyles.emptyRow}>
        No financial goals are currently recorded.
      </Text>
    );
  }

  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderText, { width: "34%" }]}>
          Goal
        </Text>
        <Text style={[reportStyles.tableHeaderText, { width: "18%" }]}>
          Category
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "18%", textAlign: "right" },
          ]}
        >
          Funded
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "18%", textAlign: "right" },
          ]}
        >
          Target
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "12%", textAlign: "right" },
          ]}
        >
          Horizon
        </Text>
      </View>

      {data.goals.map((goal, index) => (
        <View
          key={goal.title}
          style={[
            reportStyles.tableRow,
            index % 2 === 1 ? reportStyles.tableRowAlt : {},
          ]}
        >
          <Text style={[reportStyles.tableCell, { width: "34%" }]}>
            {goal.title}
          </Text>
          <Text style={[reportStyles.tableCell, { width: "18%" }]}>
            {goal.category}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "18%" }]}>
            {goal.fundedPct.toFixed(0)}%
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "18%" }]}>
            {formatUsd(goal.targetUsd)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "12%" }]}>
            {goal.yearsRemaining} yr
          </Text>
        </View>
      ))}
    </View>
  );
}

function TransactionsTable({
  rows,
  emptyMessage,
}: {
  rows: ReportTransactionRow[];
  emptyMessage: string;
}) {
  if (rows.length === 0) {
    return <Text style={reportStyles.emptyRow}>{emptyMessage}</Text>;
  }

  return (
    <View style={reportStyles.table}>
      <View style={reportStyles.tableHeader}>
        <Text style={[reportStyles.tableHeaderText, { width: "25%" }]}>
          Date
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "22%", textAlign: "right" },
          ]}
        >
          Amount
        </Text>
        <Text
          style={[
            reportStyles.tableHeaderText,
            { width: "53%", paddingLeft: 8 },
          ]}
        >
          Description
        </Text>
      </View>

      {rows.map((row, index) => (
        <View
          key={row.id}
          style={[
            reportStyles.tableRow,
            index % 2 === 1 ? reportStyles.tableRowAlt : {},
          ]}
        >
          <Text style={[reportStyles.tableCell, { width: "25%" }]}>
            {formatLongDate(row.date)}
          </Text>
          <Text style={[reportStyles.tableCellRight, { width: "22%" }]}>
            {formatUsd(row.amountUsd, true)}
          </Text>
          <Text
            style={[reportStyles.tableCell, { width: "53%", paddingLeft: 8 }]}
          >
            {row.description}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function InvestmentReportDocument({
  data,
  logoSrc = REPORT_LOGO,
}: {
  data: InvestmentReportData;
  logoSrc?: string;
}) {
  const shell = {
    clientName: data.clientName,
    clientNumber: data.clientNumber,
    totalPages: data.totalPages,
  };

  return (
    <Document
      title={`${data.reportKindTitle} — ${data.clientName}`}
      author={FIRM_LEGAL_LINE}
    >
      <CoverPage data={data} logoSrc={logoSrc} />

      <ReportPageShell {...shell} pageNumber={2}>
        <Text style={reportStyles.level1}>Executive Summary</Text>
        <ClientDetailsGrid data={data} />
        <KpiBand
          items={[
            {
              label: "Total portfolio value",
              value: formatUsd(data.totalPortfolioValueUsd),
            },
            {
              label: "Period gain",
              value: formatUsd(data.periodGainUsd, true),
            },
            {
              label: "Period return",
              value: formatPct(data.periodReturnPct, true),
            },
          ]}
        />
        <Text style={reportStyles.bodyText}>{data.executiveSummary}</Text>
        <SubsectionTitle>Period performance</SubsectionTitle>
        <PeriodPerformanceTable data={data} />
        <Text style={reportStyles.footnote}>
          Percentage change reflects returns on invested capital and excludes
          uninvested cash on account unless noted. All values in {data.currency}
          .
        </Text>
      </ReportPageShell>

      <ReportPageShell {...shell} pageNumber={3}>
        <Text style={reportStyles.level1}>Portfolio Overview</Text>
        <SubsectionTitle>Portfolio summary</SubsectionTitle>
        <OverviewTable data={data} />
        <SubsectionTitle>Portfolio allocation</SubsectionTitle>
        <View style={reportStyles.chartBox}>
          <AllocationChart slices={data.allocationSlices} />
        </View>
        <SubsectionTitle>Allocation breakdown</SubsectionTitle>
        <AllocationBreakdownTable data={data} />
      </ReportPageShell>

      <ReportPageShell {...shell} pageNumber={4}>
        <Text style={reportStyles.level1}>Performance</Text>
        <SubsectionTitle>Portfolio value over time</SubsectionTitle>
        <View style={reportStyles.chartBox}>
          <ValueChart points={data.historyPoints} />
        </View>
        <SubsectionTitle>Cumulative performance since inception</SubsectionTitle>
        <InceptionPerformanceTable data={data} />
        <SubsectionTitle>Progress against goals</SubsectionTitle>
        <GoalsTable data={data} />
      </ReportPageShell>

      <ReportPageShell {...shell} pageNumber={5}>
        <Text style={reportStyles.level1}>Transactions & Activity</Text>
        <SubsectionTitle>Recent transactions</SubsectionTitle>
        <TransactionsTable
          rows={data.transactions}
          emptyMessage="No transactions recorded for this statement period."
        />
        <SubsectionTitle>Contributions</SubsectionTitle>
        <TransactionsTable
          rows={data.contributions}
          emptyMessage="No contributions recorded for this statement period."
        />
        <SubsectionTitle>Withdrawals</SubsectionTitle>
        <TransactionsTable
          rows={data.withdrawals}
          emptyMessage="No withdrawals recorded for this statement period."
        />
      </ReportPageShell>

      <ReportPageShell {...shell} pageNumber={6}>
        <Text style={reportStyles.level1}>Advice & Important Information</Text>

        <SubsectionTitle>Recommended next steps</SubsectionTitle>
        <BulletList items={data.recommendations} />

        <SubsectionTitle>Your relationship manager</SubsectionTitle>
        {data.advisor ? (
          <>
            <Text style={reportStyles.bodyText}>{data.advisor.fullName}</Text>
            {data.advisor.title ? (
              <Text style={reportStyles.muted}>{data.advisor.title}</Text>
            ) : null}
            <Text style={reportStyles.bodyText}>{data.advisor.email}</Text>
            {data.advisor.phone ? (
              <Text style={reportStyles.bodyText}>{data.advisor.phone}</Text>
            ) : null}
          </>
        ) : (
          <Text style={reportStyles.muted}>
            Contact {FIRM_NAME} via {FIRM_CONTACT_LINE} for relationship manager
            details.
          </Text>
        )}

        <SubsectionTitle>Important notices</SubsectionTitle>
        <BulletList items={data.importantNotices} />

        <SubsectionTitle>{data.disclaimerTitle}</SubsectionTitle>
        <Text
          style={[
            reportStyles.bodyText,
            { fontSize: 7.5, lineHeight: 1.5, textAlign: "justify" },
          ]}
        >
          {data.disclaimerBody}
        </Text>

        <View
          style={{
            marginTop: 20,
            paddingTop: 12,
            borderTopWidth: 0.5,
            borderTopColor: "#e6e6ec",
          }}
        >
          <Text style={reportStyles.muted}>{FIRM_LEGAL_LINE}</Text>
          <Text style={reportStyles.muted}>{FIRM_ADDRESS}</Text>
          <Text style={reportStyles.muted}>{FIRM_CONTACT_LINE}</Text>
        </View>
      </ReportPageShell>
    </Document>
  );
}
