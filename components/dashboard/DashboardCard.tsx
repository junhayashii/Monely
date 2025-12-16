import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const DashboardCard = ({
  title,
  amount,
  icon,
  className,
  description,
}: any) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className}`}>
          R${amount.toLocaleString()}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}{" "}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
