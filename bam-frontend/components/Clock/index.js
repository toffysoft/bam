import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';
import moment from 'moment';

import { Spin, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Form = styled.div`
  justify-content: center;
  /* align-items: center; */
  display: flex;
`;

const FormBody = styled.div`
  text-align: center;
  max-width: 350px;
`;

const Btn = styled.button`
  font-weight: 700;
  /* background: #ee6226; */
  background: #464270;
  color: hsla(0, 0%, 100%, 0.9);
  padding: 0.5rem 1.5rem;
  display: inline-block;
  margin: 1rem auto 0;
  border: 0;
  text-decoration: none;
  border-radius: 2rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.1s;
  min-width: 350px;
`;

const Clock = ({ d, h, m, s }) => {
  // {`${moment(process.env.NEXT_PUBLIC_RELEASE_DATE)
  //   .utc()
  //   .format('DD MMM YYYY hh:mm A')} UTC`}
  return (
    <Form>
      <FormBody>
        <Btn style={{ marginTop: '0px' }}>
          {`${d} DAYS ${h} HOURS ${m} MIN. ${s} SEC.`}
        </Btn>
      </FormBody>
    </Form>
  );
};

export default Clock;
