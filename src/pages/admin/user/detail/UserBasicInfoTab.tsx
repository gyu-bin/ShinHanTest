// components/admin/userDetail/UserBasicInfoTab.tsx
import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Divider,
  Button,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { UserDetailType } from "./UserDetail";

type Props = {
  user: UserDetailType;
  randomLoginDate: string;
};

const UserBasicInfoTab: React.FC<Props> = ({ user, randomLoginDate }) => {
  return (
    <Box>
      <Box px={2} py={2}>
        <Typography fontWeight={600} mb={2}>
          사용자 정보
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>이름</TableCell>
              <TableCell>{user.first_name ?? "-"}</TableCell>
              <TableCell>행번</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>부서</TableCell>
              <TableCell>{user.last_name ?? "-"}</TableCell>
              <TableCell>인사 상태</TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CheckCircleIcon color="primary" />}
                  disabled
                >
                  재직
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      <Divider />

      <Box px={2} py={2}>
        <Typography fontWeight={600} mb={2}>
          접속 정보
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell>마지막 접속 일시</TableCell>
              <TableCell>{randomLoginDate}</TableCell>
              <TableCell align="right">
                <Button variant="outlined" size="small">
                  사용 이력 모니터링
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

export default UserBasicInfoTab;
