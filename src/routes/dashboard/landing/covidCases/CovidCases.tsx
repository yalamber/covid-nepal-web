import React, { useState, useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useTranslation, Trans } from 'react-i18next'

import NepalCovidCases from './NepalCovidCases';
import GlobalCovidCases from './GlobalCovidCases';
import { fetchCovidCasesCountsAPI, ICovidCasesCounts } from 'src/services/covidCases';
import RefreshIcon from 'src/components/Icons/RefreshIcon';
import { getFormattedTime } from 'src/utils/date';
import { pluralize } from 'src/utils/stringManipulation';
import lo from 'src/i18n/locale.json';

interface IUpdatedTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CovidCases = () => {
  const [covidCasesCounts, setCovidCasesCounts] = useState<ICovidCasesCounts | null>(null);
  const [updatedTime, setUpdatedTime] = useState<IUpdatedTime>({} as IUpdatedTime);
  const { t } = useTranslation();


  useEffect(() => {
    fetchCovidCases();
  }, []);

  useEffect(() => {
    getUpdatedTime();
    let covidInterval = window.setInterval(getUpdatedTime, 30000);
    return () => {
      clearInterval(covidInterval);
    };
  }, [covidCasesCounts]);

  const fetchCovidCases = async () => {
    try {
      const response = await fetchCovidCasesCountsAPI();
      setCovidCasesCounts(response);
    } catch (error) {
      console.log(error);
    } finally {
      getUpdatedTime();
    }
  };

  const getUpdatedTime = () => {
    if (covidCasesCounts) {
      const updatedDate = Date.parse(covidCasesCounts.updatedAt);
      const currentDate = Date.parse(new Date().toString());
      const intervalInSeconds = (currentDate - updatedDate) / 1000;
      const formattedTime = getFormattedTime(intervalInSeconds);
      setUpdatedTime(formattedTime);
    }
  };

  const showDays = () => {
    if (updatedTime && updatedTime.days > 0) {
      return `${updatedTime.days} ${pluralize(updatedTime.days, 'day')}`;
    } else {
      return '';
    }
  };

  const showHours = () => {
    if (updatedTime && updatedTime.hours > 0 && updatedTime.hours < 24) {
      return `${updatedTime.hours} ${pluralize(updatedTime.hours, 'hour')}`;
    } else {
      return '';
    }
  };

  const showMinutes = () => {
    if (updatedTime && updatedTime.minutes > 0 && updatedTime.minutes < 60) {
      return `${updatedTime.minutes}  ${pluralize(updatedTime.minutes, 'minute')}`;
    } else {
      return '';
    }
  };

  const showSeconds = () => {
    if (updatedTime && updatedTime.seconds > 0 && updatedTime.seconds < 60) {
      return `less than a minute`;
    } else {
      return '';
    }
  };

  return (
    <>
      <Col md="12" lg="4" className="mt-2">
        <div className="rounded bg-bluelight p-4 h-100">
          <div className="mb-3 border-bottom pb-2">
            <div className="d-inline-block">
              <div className="h5 mb-0 font-weight-bold">{`${t(lo.nav_covid19)} ${t(lo.nav_Cases)}`}</div>
              <small>
                {updatedTime && (updatedTime.days || updatedTime.hours || updatedTime.minutes)
                  ? `${t(lo.covC_Updated)} ${showDays()} ${showHours()} ${showMinutes()} ${showSeconds()} ${t(lo.covC_ago)}`
                  : ''}
                <i className="ml-2 pointer" onClick={() => fetchCovidCases()}>
                  <RefreshIcon />
                </i>
              </small>
            </div>
          </div>
          <div className="clearfix"></div>

          <Row className="mb-3">
            <NepalCovidCases covidCasesCounts={covidCasesCounts} />
            <GlobalCovidCases covidCasesCounts={covidCasesCounts} />
          </Row>

          <small>
            <Trans i18nKey={lo.covC_disclaimerNepalGovJohnsHopkins}>
              *Disclaimer: These numbers are obtained from <a
                className={'text-white'} target="_blank" rel="noopener noreferrer" href="https://heoc.mohp.gov.np/">
                Nepal Government </a> and <a
                className={'text-white'} target="_blank" rel="noopener noreferrer" href="https://coronavirus.jhu.edu/map.html">
                Johns Hopkins University</a> and being updated as the numbers from these sources get updated.
            </Trans>
          </small>
        </div>
      </Col>
    </>
  );
};

export default CovidCases;
