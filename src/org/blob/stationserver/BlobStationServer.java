package org.blob.stationserver;

import java.io.PrintStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.SocketAddress;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.ByteBuffer;
import java.nio.file.Paths;
import java.nio.channels.WritableByteChannel;
import java.nio.charset.Charset;

import org.simpleframework.http.Request;
import org.simpleframework.http.Response;
import org.simpleframework.http.core.Container;
import org.simpleframework.http.core.ContainerServer;
import org.simpleframework.transport.Server;
import org.simpleframework.transport.connect.Connection;
import org.simpleframework.transport.connect.SocketConnection;


public class BlobStationServer implements Container {

	public static String readFile(String path, Charset encoding) 
			  throws IOException 
			{
			  byte[] encoded = Files.readAllBytes(Paths.get(path));
			  return new String(encoded, encoding);
			}

    public void handle(Request request, Response response) {
      try {
         //PrintStream body = response.getPrintStream();
         OutputStream body = response.getOutputStream();
         long time = System.currentTimeMillis();
   
         response.setValue("Server", "BlobStationServer/1.0 (Simple 4.0)");
         response.setDate("Date", time);
         response.setDate("Last-Modified", time);
         
         String file =  request.getAddress().getPath().getPath();
         
         // TODO: Check that html/index.html exists
         if(file == null || file == "/" || file.lastIndexOf('.') == -1 ||
        	getClass().getResource("/html"+file) == null) {	 
        	 
        	 file = "/index.html";
         }

         String extension = file.substring(file.lastIndexOf('.')+1);
         
         if(extension.equals("jpg") || extension.equals("jpeg"))
        	 response.setValue("Content-Type", "image/jpeg");
         else if (extension.equals("png") || extension.equals("ico"))
        	 response.setValue("Content-Type", "image/png");
         else if (extension.equals("gif"))
        	 response.setValue("Content-Type", "image/gif");
         else if (extension.equals("svg") || extension.equals("svgz"))
        	 response.setValue("Content-Type", "image/svg+xml");
         else if (extension.equals("js"))
        	 response.setValue("Content-Type", "text/javascript");
         else if (extension.equals("css"))
        	 response.setValue("Content-Type", "text/css");
         else
        	 response.setValue("Content-Type", "text/html");
         
         String path = getClass().getResource("/html"+file).getPath();
         
         body.write(Files.readAllBytes(Paths.get(path)));
         body.close();
         
      } catch(Exception e) {
         e.printStackTrace();
      }
   } 

   public static void main(String[] list) throws Exception {
      Container container = new BlobStationServer();
      Server server = new ContainerServer(container);
      Connection connection = new SocketConnection(server);
      SocketAddress address = new InetSocketAddress(8080);

      connection.connect(address);   
   }
}