import React from 'react';

// Norwegian Compliance Types
type NSMLevel = 'ÅPEN' | 'BEGRENSET' | 'KONFIDENSIELT' | 'HEMMELIG';
type NorwegianLocale = 'nb' | 'nn';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface NSMClassificationProps {
  level: NSMLevel;
  displayBanner?: boolean;
  auditLog?: boolean;
}

interface GDPRComplianceProps {
  personalDataPresent: boolean;
  dataProcessingBasis: 'consent' | 'contract' | 'legal_obligation' | 'public_task';
  retentionPeriod?: string;
}

interface AccessibilityProps {
  wcagLevel: 'AA' | 'AAA';
  screenReaderOptimized: boolean;
  keyboardNavigation: boolean;
  highContrast?: boolean;
}

// Norwegian-Compliant Base Page Interface
export interface BasePageProps {
  title: string;
  nsmClassification: NSMLevel;
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  accessibilityLabel: string;
  norwegianLocale: NorwegianLocale;

  // Norwegian Compliance Props
  nsm?: NSMClassificationProps;
  gdpr?: GDPRComplianceProps;
  accessibility?: AccessibilityProps;

  // Optional Props
  municipalityCode?: string; // 4-digit Norwegian municipality code
  municipalityName?: string;
  className?: string;
  id?: string;
}

interface PageLayoutProps extends BasePageProps {
  classification: NSMLevel;
  auditLog: boolean;
  accessibilityCompliant: boolean;
}

// Norwegian Classification Banner Component
const NSMClassificationBanner: React.FC<{ level: NSMLevel }> = ({ level }) => {
  const getBannerColor = (classification: NSMLevel): string => {
    switch (classification) {
      case 'ÅPEN':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'BEGRENSET':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'KONFIDENSIELT':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'HEMMELIG':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAccessibilityLabel = (classification: NSMLevel): string => {
    switch (classification) {
      case 'ÅPEN':
        return 'Offentlig informasjon - ingen begrensninger';
      case 'BEGRENSET':
        return 'Begrenset informasjon - kontrollert tilgang';
      case 'KONFIDENSIELT':
        return 'Konfidensiell informasjon - høy sikkerhet påkrevd';
      case 'HEMMELIG':
        return 'Hemmelig informasjon - høyeste sikkerhetsnivå';
      default:
        return 'Ukjent klassifisering';
    }
  };

  return (
    <div
      className={`p-2 border-b text-center text-sm font-medium ${getBannerColor(level)}`}
      role="banner"
      aria-label={getAccessibilityLabel(level)}
    >
      🇳🇴 NSM Klassifisering: {level}
    </div>
  );
};

// Norwegian Municipality Header Component
const MunicipalityHeader: React.FC<{
  municipalityCode?: string;
  municipalityName?: string;
  locale: NorwegianLocale;
}> = ({ municipalityCode, municipalityName, locale }) => {
  if (!municipalityCode && !municipalityName) return null;

  const headerText =
    locale === 'nb'
      ? `${municipalityName || 'Kommune'} ${municipalityCode || ''}`
      : `${municipalityName || 'Kommune'} ${municipalityCode || ''}`;

  return (
    <div
      className="bg-blue-800 text-white p-3 text-center"
      role="banner"
      aria-label={`Kommune informasjon: ${headerText}`}
    >
      <h1 className="text-lg font-semibold">🏛️ {headerText}</h1>
    </div>
  );
};

// Breadcrumb Navigation Component (WCAG 2.2 AA Compliant)
const BreadcrumbNavigation: React.FC<{
  breadcrumbs: BreadcrumbItem[];
  locale: NorwegianLocale;
}> = ({ breadcrumbs, locale }) => {
  const homeLabel = locale === 'nb' ? 'Hjem' : 'Heim';

  return (
    <nav
      aria-label={locale === 'nb' ? 'Navigasjonssti' : 'Navigasjonssti'}
      className="p-4 bg-gray-50"
    >
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            aria-label={homeLabel}
          >
            {homeLabel}
          </a>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="flex items-center">
            <span className="mx-2 text-gray-400" aria-hidden="true">
              /
            </span>
            {crumb.href && !crumb.current ? (
              <a
                href={crumb.href}
                className="text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                {crumb.label}
              </a>
            ) : (
              <span
                className={crumb.current ? 'text-gray-900 font-medium' : 'text-gray-600'}
                aria-current={crumb.current ? 'page' : undefined}
              >
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Main Page Layout Component
const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  children,
  classification,
  breadcrumbs,
  accessibilityLabel,
  norwegianLocale,
  municipalityCode,
  municipalityName,
  nsm,
  gdpr,
  accessibility,
  auditLog,
  accessibilityCompliant,
  className = '',
  id,
  ...props
}) => {
  // Audit logging effect
  React.useEffect(() => {
    if (auditLog) {
      console.info('🇳🇴 NSM Audit Log:', {
        timestamp: new Date().toISOString(),
        page: title,
        classification,
        userAgent: navigator.userAgent,
        locale: norwegianLocale,
        municipality: municipalityCode,
        gdprCompliant: gdpr?.personalDataPresent ? 'GDPR data present' : 'No personal data',
        accessibilityLevel: accessibility?.wcagLevel || 'AA',
      });
    }
  }, [title, classification, auditLog, norwegianLocale, municipalityCode, gdpr, accessibility]);

  // Norwegian language HTML attributes
  const htmlLang = norwegianLocale === 'nb' ? 'nb-NO' : 'nn-NO';

  return (
    <div
      className={`min-h-screen bg-white ${className}`}
      lang={htmlLang}
      id={id}
      role="main"
      aria-label={accessibilityLabel}
    >
      {/* NSM Classification Banner */}
      {nsm?.displayBanner !== false && <NSMClassificationBanner level={classification} />}

      {/* Municipality Header */}
      <MunicipalityHeader
        municipalityCode={municipalityCode}
        municipalityName={municipalityName}
        locale={norwegianLocale}
      />

      {/* Breadcrumb Navigation */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <BreadcrumbNavigation breadcrumbs={breadcrumbs} locale={norwegianLocale} />
      )}

      {/* Page Title */}
      <header className="p-6 border-b">
        <h1 className="text-3xl font-bold text-gray-900" id="page-title">
          {title}
        </h1>

        {/* GDPR Notice */}
        {gdpr?.personalDataPresent && (
          <div
            className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded"
            role="note"
            aria-label="GDPR informasjon"
          >
            <p className="text-sm text-blue-800">
              🛡️{' '}
              {norwegianLocale === 'nb'
                ? 'Denne siden behandler personopplysninger i henhold til GDPR'
                : 'Denne sida behandlar personopplysningar i samsvar med GDPR'}
            </p>
            {gdpr.retentionPeriod && (
              <p className="text-xs text-blue-600 mt-1">
                {norwegianLocale === 'nb'
                  ? `Lagringsperiode: ${gdpr.retentionPeriod}`
                  : `Lagringsperiode: ${gdpr.retentionPeriod}`}
              </p>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="p-6" role="main" aria-labelledby="page-title" tabIndex={-1}>
        {children}
      </main>

      {/* Norwegian Government Footer */}
      <footer className="bg-gray-800 text-white p-6 mt-auto" role="contentinfo">
        <div className="text-center">
          <p className="text-sm">
            🇳🇴{' '}
            {norwegianLocale === 'nb'
              ? 'Utviklet i samsvar med norske digitale standarder'
              : 'Utvikla i samsvar med norske digitale standardar'}
          </p>
          <div className="mt-2 flex justify-center space-x-4 text-xs text-gray-300">
            <span>NSM: {classification}</span>
            {gdpr?.personalDataPresent && <span>GDPR: Aktiv</span>}
            <span>WCAG: {accessibility?.wcagLevel || 'AA'}</span>
            {municipalityCode && <span>Kommune: {municipalityCode}</span>}
          </div>
        </div>
      </footer>
    </div>
  );
};

// Norwegian-Compliant Base Page Component
export const BasePage: React.FC<BasePageProps> = ({
  title,
  nsmClassification,
  children,
  breadcrumbs,
  accessibilityLabel,
  norwegianLocale,
  nsm = { level: nsmClassification, displayBanner: true, auditLog: true },
  gdpr = { personalDataPresent: false, dataProcessingBasis: 'public_task' },
  accessibility = { wcagLevel: 'AA', screenReaderOptimized: true, keyboardNavigation: true },
  ...props
}) => {
  return (
    <PageLayout
      title={title}
      classification={nsmClassification}
      breadcrumbs={breadcrumbs}
      accessibilityLabel={accessibilityLabel}
      norwegianLocale={norwegianLocale}
      nsm={nsm}
      gdpr={gdpr}
      accessibility={accessibility}
      auditLog={true}
      accessibilityCompliant={true}
      {...props}
    >
      {children}
    </PageLayout>
  );
};

// Export additional utility components
export { BreadcrumbNavigation, MunicipalityHeader, NSMClassificationBanner, PageLayout };

// Norwegian Government Component Standards
export default BasePage;
