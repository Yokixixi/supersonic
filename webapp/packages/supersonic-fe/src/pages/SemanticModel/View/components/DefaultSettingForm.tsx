import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import type { ForwardRefRenderFunction } from 'react';
import FormItemTitle from '@/components/FormHelper/FormItemTitle';

import { Form, Input, Select, InputNumber } from 'antd';

import { wrapperTransTypeAndId } from '../../utils';

import { ISemantic } from '../../data';
import { ChatConfigType, TransType, SemanticNodeType } from '../../enum';
import TransTypeTag from '../../components/TransTypeTag';

type Props = {
  // entityData: any;
  // chatConfigKey: string;
  chatConfigType: ChatConfigType.TAG | ChatConfigType.METRIC;
  metricList?: ISemantic.IMetricItem[];
  dimensionList?: ISemantic.IDimensionItem[];
  form: any;
  // domainId: number;
  // onSubmit: (params?: any) => void;
};

const FormItem = Form.Item;
const Option = Select.Option;

const formDefaultValue = {
  unit: 7,
  period: 'DAY',
  timeMode: 'LAST',
};

const DefaultSettingForm: ForwardRefRenderFunction<any, Props> = (
  { metricList, dimensionList, chatConfigType, form },
  ref,
) => {
  const [dataItemListOptions, setDataItemListOptions] = useState<any>([]);

  const initData = () => {
    form.setFieldsValue({
      queryConfig: {
        [defaultConfigKeyMap[chatConfigType]]: {
          timeDefaultConfig: {
            ...formDefaultValue,
          },
        },
      },
    });
  };

  useEffect(() => {
    if (form && !form.getFieldValue('id')) {
      initData();
    }
  }, []);

  const defaultConfigKeyMap = {
    [ChatConfigType.TAG]: 'tagTypeDefaultConfig',
    [ChatConfigType.METRIC]: 'metricTypeDefaultConfig',
  };

  useEffect(() => {
    if (Array.isArray(dimensionList) && Array.isArray(metricList)) {
      const dimensionEnum = dimensionList.map((item: ISemantic.IDimensionItem) => {
        const { name, id, bizName } = item;
        return {
          name,
          label: (
            <>
              <TransTypeTag type={SemanticNodeType.DIMENSION} />
              {name}
            </>
          ),
          value: wrapperTransTypeAndId(TransType.DIMENSION, id),
          bizName,
          id,
          transType: TransType.DIMENSION,
        };
      });
      const metricEnum = metricList.map((item: ISemantic.IMetricItem) => {
        const { name, id, bizName } = item;
        return {
          name,
          label: (
            <>
              <TransTypeTag type={SemanticNodeType.METRIC} />
              {name}
            </>
          ),
          value: wrapperTransTypeAndId(TransType.METRIC, id),
          bizName,
          id,
          transType: TransType.METRIC,
        };
      });
      setDataItemListOptions([...dimensionEnum, ...metricEnum]);
    }
  }, [dimensionList, metricList]);

  return (
    <>
      {chatConfigType === ChatConfigType.TAG && (
        <FormItem
          name={['queryConfig', defaultConfigKeyMap[ChatConfigType.TAG], 'defaultDisplayInfo']}
          label="圈选结果展示字段"
          getValueFromEvent={(value, items) => {
            const result: { dimensionIds: number[]; metricIds: number[] } = {
              dimensionIds: [],
              metricIds: [],
            };
            items.forEach((item: any) => {
              if (item.transType === TransType.DIMENSION) {
                result.dimensionIds.push(item.id);
              }
              if (item.transType === TransType.METRIC) {
                result.metricIds.push(item.id);
              }
            });
            return result;
          }}
          getValueProps={(value) => {
            const { dimensionIds, metricIds } = value || {};
            const dimensionValues = Array.isArray(dimensionIds)
              ? dimensionIds.map((id: number) => {
                  return wrapperTransTypeAndId(TransType.DIMENSION, id);
                })
              : [];
            const metricValues = Array.isArray(metricIds)
              ? metricIds.map((id: number) => {
                  return wrapperTransTypeAndId(TransType.METRIC, id);
                })
              : [];
            return {
              value: [...dimensionValues, ...metricValues],
            };
          }}
        >
          <Select
            mode="multiple"
            allowClear
            style={{ width: '100%' }}
            optionLabelProp="name"
            filterOption={(inputValue: string, item: any) => {
              const { name } = item;
              if (name.includes(inputValue)) {
                return true;
              }
              return false;
            }}
            placeholder="请选择圈选结果展示字段"
            options={dataItemListOptions}
          />
        </FormItem>
      )}
      <FormItem
        label={
          <FormItemTitle
            title={'时间范围'}
            subTitle={'问答搜索结果选择中，如果没有指定时间范围，将会采用默认时间范围'}
          />
        }
      >
        <Input.Group compact>
          {chatConfigType === ChatConfigType.TAG ? (
            <span
              style={{
                display: 'inline-block',
                lineHeight: '32px',
                marginRight: '8px',
              }}
            >
              前
            </span>
          ) : (
            <>
              <FormItem
                name={[
                  'queryConfig',
                  defaultConfigKeyMap[chatConfigType],
                  'timeDefaultConfig',
                  'timeMode',
                ]}
                noStyle
              >
                <Select style={{ width: '90px' }}>
                  <Option value="LAST">前</Option>
                  <Option value="RECENT">最近</Option>
                </Select>
              </FormItem>
            </>
          )}
          <FormItem
            name={['queryConfig', defaultConfigKeyMap[chatConfigType], 'timeDefaultConfig', 'unit']}
            noStyle
          >
            <InputNumber style={{ width: '120px' }} />
          </FormItem>
          <FormItem
            name={[
              'queryConfig',
              defaultConfigKeyMap[chatConfigType],
              'timeDefaultConfig',
              'period',
            ]}
            noStyle
          >
            <Select style={{ width: '90px' }}>
              <Option value="DAY">天</Option>
              <Option value="WEEK">周</Option>
              <Option value="MONTH">月</Option>
              <Option value="YEAR">年</Option>
            </Select>
          </FormItem>
        </Input.Group>
      </FormItem>
    </>
  );
};

export default forwardRef(DefaultSettingForm);
