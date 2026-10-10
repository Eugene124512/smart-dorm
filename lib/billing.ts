import { roundPeso } from "@/lib/format";

export type OccupancyWeight = {
  tenantId: string;
  name: string;
  roomNumber: string;
  hoursPresent: number;
};

export type SplitShare = OccupancyWeight & {
  percent: number;
  amount: number;
};

export function splitMasterInvoice(
  masterAmount: number,
  tenants: OccupancyWeight[],
): SplitShare[] {
  const totalHours = tenants.reduce((sum, tenant) => sum + tenant.hoursPresent, 0);

  if (tenants.length === 0) return [];

  if (totalHours <= 0) {
    const even = roundPeso(masterAmount / tenants.length);
    return tenants.map((tenant, index) => {
      const amount =
        index === tenants.length - 1
          ? roundPeso(masterAmount - even * (tenants.length - 1))
          : even;
      return {
        ...tenant,
        percent: 100 / tenants.length,
        amount,
      };
    });
  }

  let allocated = 0;
  return tenants.map((tenant, index) => {
    const percent = (tenant.hoursPresent / totalHours) * 100;
    const amount =
      index === tenants.length - 1
        ? roundPeso(masterAmount - allocated)
        : roundPeso(masterAmount * (tenant.hoursPresent / totalHours));
    allocated = roundPeso(allocated + amount);
    return { ...tenant, percent, amount };
  });
}
