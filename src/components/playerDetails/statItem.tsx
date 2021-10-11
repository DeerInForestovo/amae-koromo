import {
  Box,
  Typography,
  Tooltip,
  TooltipProps,
  styled,
  tooltipClasses,
  TypographyProps,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import React, { ReactNode } from "react";
import { useTranslation } from "react-i18next";

export const StatTooltip = styled(({ className, ...props }: TooltipProps) => {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up("md"));
  return <Tooltip placement={matches ? "bottom" : "bottom-end"} {...props} classes={{ popper: className }} />;
})(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}.${tooltipClasses.tooltip}.${tooltipClasses.tooltip}.${tooltipClasses.tooltip}`]: {
    textAlign: "center",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export const StatList = styled(Box)(({ theme }) => ({
  display: "grid",
  justifyContent: "space-between",
  gridGap: theme.spacing(1.5),
  gridTemplateColumns: "1fr",
  [theme.breakpoints.down("sm")]: {
    gridGap: theme.spacing(0.5),
    "& > div": {
      borderBottom: `1px dashed ${theme.palette.grey[500]}`,
      paddingBottom: theme.spacing(0.5),
    },
  },
  [theme.breakpoints.down("sm") + " and (min-width: 410px)"]: {
    "&:not(.mobile-1col)": {
      gridTemplateColumns: "repeat(2, min-content)",
    },
  },
  [theme.breakpoints.up("sm")]: {
    gridTemplateColumns: "repeat(2, min-content)",
  },
  "@media (min-width: 767px)": {
    gridTemplateColumns: "repeat(3, min-content)",
    ".lang-en &, .lang-ko &": {
      gridTemplateColumns: "repeat(2, min-content)",
    },
  },
  [theme.breakpoints.up("lg")]: {
    ".lang-en &, .lang-ko &": {
      gridTemplateColumns: "repeat(3, min-content)",
    },
  },
}));

export default function StatItem({
  label,
  description = "",
  i18nNamespace,
  children,
  valueProps = {},
}: {
  label: string;
  description?: ReactNode;
  i18nNamespace?: string[];
  children: React.ReactChild;
  valueProps?: TypographyProps;
}) {
  const { t } = useTranslation(i18nNamespace);
  const translatedTip =
    (description ? (typeof description === "string" ? t(description).toString() : description) : "") || "";
  return (
    <Box display="flex" justifyContent="space-between">
      <Typography variant="subtitle2" lineHeight="1.25" mr={[1, 2]} noWrap textOverflow="initial">
        {t(label)}
      </Typography>
      <StatTooltip
        title={
          translatedTip && typeof translatedTip === "string" ? (
            <Box whiteSpace="pre-wrap">{translatedTip}</Box>
          ) : (
            translatedTip
          )
        }
        arrow
      >
        <Typography variant="body2" lineHeight="1.25" noWrap textAlign="right" {...valueProps}>
          {children}
        </Typography>
      </StatTooltip>
    </Box>
  );
}
