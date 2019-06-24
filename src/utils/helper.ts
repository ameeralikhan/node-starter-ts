import * as _ from 'lodash';

export const rejectUndefinedOrNull = (id: string) => _.isUndefined(id) || _.isNull(id) || _.isEmpty(id);
