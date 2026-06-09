package com.wmsbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.Inet4Address;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.List;

@RestController
@RequestMapping("/api/network")
public class NetworkController {

    @GetMapping("/local-ips")
    public ResponseEntity<List<String>> getLocalIpAddresses() {
        List<String> priorityIps = new ArrayList<>();
        List<String> otherIps = new ArrayList<>();
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                NetworkInterface networkInterface = interfaces.nextElement();
                if (networkInterface.isLoopback() || !networkInterface.isUp() || networkInterface.isVirtual()) {
                    continue;
                }
                
                String displayName = networkInterface.getDisplayName().toLowerCase();
                // Bỏ qua WSL, VirtualBox, VMware, vEthernet (ảo)
                if (displayName.contains("wsl") || displayName.contains("virtual") || 
                    displayName.contains("vbox") || displayName.contains("vmware") || 
                    displayName.contains("vethernet") || displayName.contains("pseudo")) {
                    continue;
                }

                Enumeration<InetAddress> addresses = networkInterface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    InetAddress address = addresses.nextElement();
                    if (address instanceof Inet4Address && !address.isLoopbackAddress()) {
                        String ip = address.getHostAddress();
                        
                        // Kiểm tra nếu là dải IP mạng LAN thông dụng (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
                        if (ip.startsWith("192.168.") || ip.startsWith("10.")) {
                            priorityIps.add(ip);
                        } else if (ip.startsWith("172.")) {
                            // Chỉ lấy 172.x nếu không phải dải 172.20 của WSL bạn đang gặp
                            String[] parts = ip.split("\\.");
                            int secondOctet = Integer.parseInt(parts[1]);
                            if (secondOctet >= 16 && secondOctet <= 31 && secondOctet != 20) {
                                priorityIps.add(ip);
                            } else {
                                otherIps.add(ip);
                            }
                        } else {
                            otherIps.add(ip);
                        }
                    }
                }
            }
        } catch (SocketException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
        
        priorityIps.addAll(otherIps);
        return ResponseEntity.ok(priorityIps);
    }
}
