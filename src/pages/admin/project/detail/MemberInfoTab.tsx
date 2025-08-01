import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useApi } from "../../../../hooks/useApi";

const CLIENT_ID = "a864dbd3-504e-4854-81d7-b43b9c0ddfb8";

const MemberInfoTab = () => {
  const { get } = useApi();
  const [roleName, setRoleName] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRoleAndUsers = async () => {
      try {
        const { data: roles = [] } = await get<{ data: any[] }>(
          `/projects/${CLIENT_ID}/roles`,
        );

        if (!roles.length) {
          setError("등록된 역할이 없습니다.");
          return;
        }

        const firstRoleName = roles[0].name;
        setRoleName(firstRoleName);

        const { data: users = [] } = await get<{ data: any[] }>(
          `/projects/${CLIENT_ID}/roles/${firstRoleName}/users?page=1&size=10`,
        );

        setMembers(users);
      } catch (err) {
        console.error("구성원 정보를 불러오는 중 오류 발생:", err);
        setError("구성원 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAndUsers();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!members.length) {
    return (
      <Box mt={2}>
        <Typography>해당 역할에 구성원이 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box mt={2}>
      <Typography variant="subtitle2" mb={2}>
        [{roleName}] 역할의 구성원
      </Typography>
      {members.map((user, idx) => (
        <Box
          key={user.user_id ?? idx}
          mb={1}
          p={1}
          border={1}
          borderRadius={2}
          borderColor="#eee"
        >
          <Typography>
            <b>이름:</b> {user.first_name}
            {user.last_name}
          </Typography>
          <Typography>
            <b>이메일:</b> {user.email ?? "-"}
          </Typography>
          <Typography>
            <b>소속:</b> {user.department ?? "-"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default MemberInfoTab;
